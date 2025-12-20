const RoleRequest = require("../models/RoleRequest");
const Role = require("../models/Role");
const User = require("../models/User");

class RoleRequestController {
  // ================= USER SEND REQUEST =================
  async requestRole(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId).populate("role");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

   
      const existing = await RoleRequest.findOne({
        user: userId,
        status: "pending",
      });

      if (existing) {
        return res
          .status(400)
          .json({ message: "You already have a pending request" });
      }

      const request = await RoleRequest.create({
        user: userId,
      });

      res.status(201).json({
        success: true,
        message: "Role change request sent to admin",
        data: request,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  // ================= ADMIN REVIEW REQUEST =================
  async reviewRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { action, roleName } = req.body;
      // action: accept | reject
      // roleName: formateur | etudiant

      const request = await RoleRequest.findById(requestId).populate("user");
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (request.status !== "pending") {
        return res
          .status(400)
          .json({ message: "Request already reviewed" });
      }

      if (action === "reject") {
        request.status = "rejected";
        request.reviewedBy = req.user.id;
        await request.save();

        return res.json({ message: "Request rejected" });
      }

      // accept
      if (action === "accept") {
        if (!["formateur", "etudiant"].includes(roleName)) {
          return res.status(400).json({ message: "Invalid role" });
        }

        const roleDoc = await Role.findOne({ name: roleName });
        if (!roleDoc) {
          return res.status(404).json({ message: "Role not found" });
        }

        // نبدلو role ديال user
        await User.findByIdAndUpdate(request.user._id, {
          role: roleDoc._id,
        });

        request.status = "accepted";
        request.reviewedBy = req.user.id;
        await request.save();

        return res.json({
          message: `Role changed to ${roleName} successfully`,
        });
      }

      res.status(400).json({ message: "Invalid action" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new RoleRequestController();
