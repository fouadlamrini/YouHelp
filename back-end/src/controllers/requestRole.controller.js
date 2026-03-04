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



  // ================= GET ALL REQUESTS (filtered by role) =================
  // super_admin: all; admin: same campus (requesting user); formateur: same campus + same class
  async getAllRequests(req, res) {
    try {
      const currentUser = await User.findById(req.user.id)
        .populate("role", "name")
        .populate("campus", "name")
        .populate("class", "name");
      if (!currentUser) return res.status(401).json({ message: "Unauthorized" });

      let query = RoleRequest.find()
        .populate({
          path: "user",
          select: "name email campus class",
          populate: [
            { path: "campus", select: "name" },
            { path: "class", select: "name" },
          ],
        })
        .sort({ createdAt: -1 });

      const roleName = currentUser.role?.name || null;
      if (roleName === "admin" && currentUser.campus) {
        query = query.where("user").in(
          await User.find({ campus: currentUser.campus._id }).distinct("_id")
        );
      } else if (roleName === "formateur") {
        if (currentUser.campus && currentUser.class) {
          query = query.where("user").in(
            await User.find({
              campus: currentUser.campus._id,
              class: currentUser.class._id,
            }).distinct("_id")
          );
        } else {
          query = query.where("_id", -1);
        }
      }

      const requests = await query;
      return res.json({ success: true, data: requests });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async _canManageRequest(currentUser, requestUser) {
    const roleName = currentUser.role?.name || null;
    if (roleName === "super_admin") return true;
    if (roleName === "admin") {
      if (!currentUser.campus) return true;
      return requestUser.campus && requestUser.campus.toString() === currentUser.campus._id.toString();
    }
    if (roleName === "formateur") {
      if (!currentUser.campus || !currentUser.class) return false;
      return (
        requestUser.campus && requestUser.class &&
        requestUser.campus.toString() === currentUser.campus._id.toString() &&
        requestUser.class.toString() === currentUser.class._id.toString()
      );
    }
    return false;
  }

  // ================= REJECT =================
  async rejectRequest(req, res) {
    try {
      const { requestId } = req.params;
      const request = await RoleRequest.findById(requestId).populate({
        path: "user",
        populate: [{ path: "campus" }, { path: "class" }],
      });
      if (!request) return res.status(404).json({ message: "Request not found" });
      if (request.status !== "pending") {
        return res.status(400).json({ message: "Request already reviewed" });
      }
      const currentUser = await User.findById(req.user.id)
        .populate("role", "name")
        .populate("campus")
        .populate("class");
      const can = await this._canManageRequest(currentUser, request.user);
      if (!can) return res.status(403).json({ message: "Forbidden" });
      request.status = "rejected";
      await request.save();
      res.json({ success: true, message: "Role request rejected" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }

  // ================= ACCEPT FORMATEUR (admin + super_admin only) =================
  async acceptAsFormateur(req, res) {
    try {
      const { requestId } = req.params;
      const request = await RoleRequest.findById(requestId).populate({
        path: "user",
        populate: [{ path: "role" }, { path: "campus" }, { path: "class" }],
      });
      if (!request) return res.status(404).json({ message: "Request not found" });
      if (request.status !== "pending") {
        return res.status(400).json({ message: "Request already reviewed" });
      }
      const requestUserRoleName = request.user.role?.name || null;
      if (requestUserRoleName && requestUserRoleName !== "etudiant") {
        return res.status(400).json({ message: "User already has a role" });
      }
      const currentUser = await User.findById(req.user.id)
        .populate("role", "name")
        .populate("campus")
        .populate("class");
      const roleName = currentUser.role?.name || null;
      if (roleName !== "super_admin" && roleName !== "admin") {
        return res.status(403).json({ message: "Only admin or super_admin can accept as formateur" });
      }
      const can = await this._canManageRequest(currentUser, request.user);
      if (!can) return res.status(403).json({ message: "Forbidden" });
      const roleDoc = await Role.findOne({ name: "formateur" });
      await User.findByIdAndUpdate(request.user._id, { role: roleDoc._id });
      request.status = "accepted";
      await request.save();
      res.json({ success: true, message: "User role changed to formateur" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }

  // ================= ACCEPT ETUDIANT (admin, super_admin, formateur) =================
  async acceptAsEtudiant(req, res) {
    try {
      const { requestId } = req.params;
      const request = await RoleRequest.findById(requestId).populate({
        path: "user",
        populate: [{ path: "role" }, { path: "campus" }, { path: "class" }],
      });
      if (!request) return res.status(404).json({ message: "Request not found" });
      if (request.status !== "pending") {
        return res.status(400).json({ message: "Request already reviewed" });
      }
      const requestUserRoleNameForEtudiant = request.user.role?.name || null;
      if (requestUserRoleNameForEtudiant === "super_admin" || requestUserRoleNameForEtudiant === "admin") {
        return res.status(400).json({ message: "User already has a role" });
      }
      const currentUser = await User.findById(req.user.id)
        .populate("role", "name")
        .populate("campus")
        .populate("class");
      const can = await this._canManageRequest(currentUser, request.user);
      if (!can) return res.status(403).json({ message: "Forbidden" });
      const roleDoc = await Role.findOne({ name: "etudiant" });
      await User.findByIdAndUpdate(request.user._id, { role: roleDoc._id });
      request.status = "accepted";
      await request.save();
      res.json({ success: true, message: "User role changed to etudiant" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new RoleRequestController();
