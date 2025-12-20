const RoleRequest = require("../models/RoleRequest");
const Role = require("../models/Role");
const User = require("../models/User");

class RoleRequestController {
  // ================= USER SEND REQUEST =================
  // connected user فقط
  async requestRole(req, res) {
    try {
      const userId = req.user.id;

      // نتأكد user موجود
      const user = await User.findById(userId).populate("role");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // نمنعو إلا كان عندو request pending
      const existingRequest = await RoleRequest.findOne({
        user: userId,
        status: "pending",
      });

      if (existingRequest) {
        return res.status(400).json({
          message: "You already have a pending role request",
        });
      }

      // إنشاء request خاوي
      const request = await RoleRequest.create({
        user: userId,
      });

      return res.status(201).json({
        success: true,
        message: "Role change request sent successfully",
        data: request,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  // ================= ADMIN: GET ALL REQUESTS =================
  async getAllRequests(req, res) {
    try {
      const requests = await RoleRequest.find()
        .populate("user", "name email")
        .populate("reviewedBy", "name email")
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        data: requests,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  // ================= ADMIN REVIEW REQUEST =================
  async reviewRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { action, roleName } = req.body;
      // action: accept | reject
      // roleName: formateur | etudiant (غير إلا accept)

      const request = await RoleRequest.findById(requestId).populate("user");
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (request.status !== "pending") {
        return res
          .status(400)
          .json({ message: "Request already reviewed" });
      }

      // ================= REJECT =================
      if (action === "reject") {
        request.status = "rejected";
        request.reviewedBy = req.user.id;
        await request.save();

        return res.json({
          success: true,
          message: "Role request rejected",
        });
      }

      // ================= ACCEPT =================
      if (action === "accept") {
        if (!["formateur", "etudiant"].includes(roleName)) {
          return res.status(400).json({ message: "Invalid role" });
        }

        const roleDoc = await Role.findOne({ name: roleName });
        if (!roleDoc) {
          return res.status(404).json({ message: "Role not found" });
        }

        // تغيير role ديال user
        await User.findByIdAndUpdate(request.user._id, {
          role: roleDoc._id,
        });

        request.status = "accepted";
        request.reviewedBy = req.user.id;
        await request.save();

        return res.json({
          success: true,
          message: `Role changed to ${roleName} successfully`,
        });
      }

      return res.status(400).json({ message: "Invalid action" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new RoleRequestController();
