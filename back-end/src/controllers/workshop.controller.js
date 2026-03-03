const Workshop = require("../models/Workshop");
const WorkshopRequest = require("../models/WorkshopRequest");

class WorkshopController {
  async createWorkshop(req, res) {
    try {
      const { title, description, date } = req.body;
      if (!title?.trim()) return res.status(400).json({ message: "Title required" });
      const workshop = await Workshop.create({
        title: title.trim(),
        description: description?.trim(),
        date: date ? new Date(date) : undefined,
        createdBy: req.user.id,
      });
      res.status(201).json({ success: true, data: workshop });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getAllWorkshops(req, res) {
    try {
      const workshops = await Workshop.find()
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });
      res.json({ success: true, data: workshops });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async requestWorkshop(req, res) {
    try {
      const { workshopId } = req.params;
      const workshop = await Workshop.findById(workshopId);
      if (!workshop) return res.status(404).json({ message: "Workshop not found" });
      const existing = await WorkshopRequest.findOne({ user: req.user.id, workshop: workshopId });
      if (existing) {
        if (existing.status === "pending") {
          return res.status(400).json({ message: "You already have a pending request for this workshop" });
        }
        if (existing.status === "accepted") {
          return res.status(400).json({ message: "You are already accepted for this workshop" });
        }
      }
      const request = await WorkshopRequest.create({
        user: req.user.id,
        workshop: workshopId,
        status: "pending",
      });
      const populated = await WorkshopRequest.findById(request._id)
        .populate("user", "name email")
        .populate("workshop", "title date");
      res.status(201).json({ success: true, data: populated });
    } catch (err) {
      console.error(err);
      if (err.code === 11000) return res.status(400).json({ message: "Request already exists" });
      res.status(500).json({ message: "Server error" });
    }
  }

  async getMyRequests(req, res) {
    try {
      const requests = await WorkshopRequest.find({ user: req.user.id })
        .populate("workshop", "title description date")
        .sort({ createdAt: -1 });
      res.json({ success: true, data: requests });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new WorkshopController();
