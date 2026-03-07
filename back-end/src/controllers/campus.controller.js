const Campus = require("../models/Campus");

class CampusController {
  async getAll(req, res) {
    try {
      const campuses = await Campus.find().sort({ createdAt: -1 });
      res.json({ success: true, data: campuses });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getById(req, res) {
    try {
      const campus = await Campus.findById(req.params.id);
      if (!campus) return res.status(404).json({ message: "Campus not found" });
      res.json({ success: true, data: campus });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async create(req, res) {
    try {
      const { name } = req.body;
      const existing = await Campus.findOne({ name: name.trim() });
      if (existing) {
        return res.status(400).json({ message: "Campus already exists" });
      }
      const campus = await Campus.create({ name: name.trim() });
      res.status(201).json({ success: true, data: campus });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const campus = await Campus.findByIdAndUpdate(
        id,
        { name: name.trim() },
        { new: true, runValidators: true }
      );
      if (!campus) return res.status(404).json({ message: "Campus not found" });
      res.json({ success: true, data: campus });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async delete(req, res) {
    try {
      const campus = await Campus.findByIdAndDelete(req.params.id);
      if (!campus) return res.status(404).json({ message: "Campus not found" });
      res.json({ success: true, message: "Campus deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new CampusController();
