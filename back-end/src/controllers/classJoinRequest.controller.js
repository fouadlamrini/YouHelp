const ClassJoinRequest = require("../models/ClassJoinRequest");
const User = require("../models/User");

class ClassJoinRequestController {
  async create(req, res) {
    try {
      const { classId } = req.body;
      if (!classId) return res.status(400).json({ message: "classId required" });
      const classDoc = await require("../models/Class").findById(classId);
      if (!classDoc) return res.status(404).json({ message: "Class not found" });
      const existing = await ClassJoinRequest.findOne({ user: req.user.id, class: classId });
      if (existing) {
        if (existing.status === "pending") {
          return res.status(400).json({ message: "You already have a pending request for this class" });
        }
        if (existing.status === "accepted") {
          return res.status(400).json({ message: "You are already in this class" });
        }
      }
      const request = await ClassJoinRequest.create({
        user: req.user.id,
        class: classId,
        status: "pending",
      });
      const populated = await ClassJoinRequest.findById(request._id)
        .populate("user", "name email")
        .populate("class", "name");
      res.status(201).json({ success: true, data: populated });
    } catch (err) {
      console.error(err);
      if (err.code === 11000) return res.status(400).json({ message: "Request already exists" });
      res.status(500).json({ message: "Server error" });
    }
  }

  async getRequestsForMyClass(req, res) {
    try {
      const currentUser = await User.findById(req.user.id).populate("class");
      if (!currentUser?.class) {
        return res.status(403).json({ message: "You are not assigned to a class" });
      }
      const requests = await ClassJoinRequest.find({ class: currentUser.class._id, status: "pending" })
        .populate("user", "name email")
        .populate("class", "name")
        .sort({ createdAt: -1 });
      res.json({ success: true, data: requests });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async accept(req, res) {
    try {
      const { id } = req.params;
      const request = await ClassJoinRequest.findById(id).populate("class");
      if (!request) return res.status(404).json({ message: "Request not found" });
      if (request.status !== "pending") {
        return res.status(400).json({ message: "Request already reviewed" });
      }
      const formateur = await User.findById(req.user.id).populate("class");
      if (!formateur.class || formateur.class._id.toString() !== request.class._id.toString()) {
        return res.status(403).json({ message: "You can only accept requests for your class" });
      }
      await User.findByIdAndUpdate(request.user, {
        class: request.class._id,
      });
      request.status = "accepted";
      await request.save();
      res.json({ success: true, message: "User accepted into class" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async reject(req, res) {
    try {
      const { id } = req.params;
      const request = await ClassJoinRequest.findById(id).populate("class");
      if (!request) return res.status(404).json({ message: "Request not found" });
      if (request.status !== "pending") {
        return res.status(400).json({ message: "Request already reviewed" });
      }
      const formateur = await User.findById(req.user.id).populate("class");
      if (!formateur.class || formateur.class._id.toString() !== request.class._id.toString()) {
        return res.status(403).json({ message: "You can only reject requests for your class" });
      }
      request.status = "rejected";
      await request.save();
      res.json({ success: true, message: "Request rejected" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new ClassJoinRequestController();
