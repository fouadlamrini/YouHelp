const levelService = require("../services/level.service");

class LevelController {
  getAll = async (req, res) => {
    try {
      const result = await levelService.getAll();
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  getById = async (req, res) => {
    try {
      const result = await levelService.getById(req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  create = async (req, res) => {
    try {
      const result = await levelService.create(req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.status(201).json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(400).json({ message: "Invalid level name" });
      }
      return res.status(500).json({ message: "Server error" });
    }
  };

  update = async (req, res) => {
    try {
      const result = await levelService.update(req.params.id, req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(400).json({ message: "Invalid level name" });
      }
      return res.status(500).json({ message: "Server error" });
    }
  };

  delete = async (req, res) => {
    try {
      const result = await levelService.deleteLevel(req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, message: "Level deleted successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = new LevelController();
