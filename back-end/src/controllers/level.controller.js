const Level = require("../models/Level");

class LevelController {
  async getAll(req, res) {
    try {
      const levels = await Level.find().sort({ createdAt: -1 });
      res.json({ success: true, data: levels });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getById(req, res) {
    try {
      const level = await Level.findById(req.params.id);
      if (!level) return res.status(404).json({ message: "Level not found" });
      res.json({ success: true, data: level });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async create(req, res) {
    try {
      const { name } = req.body;
      const existing = await Level.findOne({ name: name.trim() });
      if (existing) {
        return res.status(400).json({ message: "Level already exists" });
      }
      const level = await Level.create({ name: name.trim() });
      res.status(201).json({ success: true, data: level });
    } catch (err) {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(400).json({ message: "Invalid level name" });
      }
      res.status(500).json({ message: "Server error" });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const level = await Level.findByIdAndUpdate(
        id,
        { name: name.trim() },
        { new: true, runValidators: true }
      );
      if (!level) return res.status(404).json({ message: "Level not found" });
      res.json({ success: true, data: level });
    } catch (err) {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(400).json({ message: "Invalid level name" });
      }
      res.status(500).json({ message: "Server error" });
    }
  }

  async delete(req, res) {
    try {
      const level = await Level.findByIdAndDelete(req.params.id);
      if (!level) return res.status(404).json({ message: "Level not found" });
      res.json({ success: true, message: "Level deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new LevelController();
