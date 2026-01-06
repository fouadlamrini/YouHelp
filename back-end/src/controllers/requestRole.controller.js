const RoleRequest = require("../models/RoleRequest");
const Role = require("../models/Role");
const User = require("../models/User");

class RoleRequestController {
  // ================= USER SEND REQUEST =================
  
async requestRole(req, res) {
  try {
    const userId = req.user.id;

    const lastRequest = await RoleRequest.findOne({ user: userId }).sort({ createdAt: -1 });

    if (lastRequest) {
      if (lastRequest.status === "pending") {
        return res.status(400).json({
          message: "You already have a pending request",
        });
      }
      if (lastRequest.status === "accepted") {
        return res.status(400).json({
          message: "Your role request has already been accepted",
        });
      }
      if (lastRequest.status === "rejected") {
        lastRequest.status = "pending";
        await lastRequest.save();
        return res.status(200).json({
          success: true,
          message: "Role change request resubmitted successfully",
          data: lastRequest,
        });
      }
    }
    const request = await RoleRequest.create({
      user: userId,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Role change request sent successfully",
      data: request,
    });
  } catch (error) {
    console.error("RequestRole Error:", error);
    return res.status(500).json({ message: error.message });
  }
}



  // ================= ADMIN: GET ALL REQUESTS =================
  async getAllRequests(req, res) {
    try {
      const requests = await RoleRequest.find()
        .populate("user", "name email")
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

  // ================= REJECT =================
  async rejectRequest(req, res) {
    try {
      const { requestId } = req.params;

      const request = await RoleRequest.findById(requestId);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (request.status !== "pending") {
        return res.status(400).json({ message: "Request already reviewed" });
      }

      request.status = "rejected";
      await request.save();

      res.json({
        success: true,
        message: "Role request rejected",
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }

  // ================= ACCEPT FORMATEUR =================
  async acceptAsFormateur(req, res) {
    try {
      const { requestId } = req.params;

      const request = await RoleRequest.findById(requestId).populate({
        path: "user",
        populate: { path: "role" },
      });

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (request.status !== "pending") {
        return res.status(400).json({ message: "Request already reviewed" });
      }

      if (request.user.role.name !== "connected") {
        return res
          .status(400)
          .json({ message: "User is no longer connected" });
      }

      const roleDoc = await Role.findOne({ name: "formateur" });

      await User.findByIdAndUpdate(request.user._id, {
        role: roleDoc._id,
      });

      request.status = "accepted";
      await request.save();

      res.json({
        success: true,
        message: "User role changed to formateur",
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }

  // ================= ACCEPT ETUDIANT =================
  async acceptAsEtudiant(req, res) {
    try {
      const { requestId } = req.params;

      const request = await RoleRequest.findById(requestId).populate({
        path: "user",
        populate: { path: "role" },
      });

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (request.status !== "pending") {
        return res.status(400).json({ message: "Request already reviewed" });
      }

      if (request.user.role.name !== "connected") {
        return res
          .status(400)
          .json({ message: "User is no longer connected" });
      }

      const roleDoc = await Role.findOne({ name: "etudiant" });

      await User.findByIdAndUpdate(request.user._id, {
        role: roleDoc._id,
      });

      request.status = "accepted";
      await request.save();

      res.json({
        success: true,
        message: "User role changed to etudiant",
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new RoleRequestController();
