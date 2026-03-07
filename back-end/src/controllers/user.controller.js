const userService = require("../services/user.service");

class UserController {
  getMe = async (req, res) => {
    try {
      const result = await userService.getMe(req.user.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  updateProfile = async (req, res) => {
    try {
      const result = await userService.updateProfile(req.user.id, req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  getAll = async (req, res) => {
    try {
      const result = await userService.getAll(req.user.id);
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
      const result = await userService.getById(req.user.id, req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async update(req, res) {
    try {
      const result = await userService.update(req.user.id, req.params.id, req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  delete = async (req, res) => {
    try {
      const result = await userService.deleteUser(req.user.id, req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  acceptUser = async (req, res) => {
    try {
      const result = await userService.acceptUser(req.user.id, req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error("acceptUser error:", err);
      return res.status(500).json({ message: err.message || "Server error" });
    }
  };

  rejectUser = async (req, res) => {
    try {
      const result = await userService.rejectUser(req.user.id, req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error("rejectUser error:", err);
      return res.status(500).json({ message: err.message || "Server error" });
    }
  };

  create = async (req, res) => {
    try {
      const result = await userService.create(req.user.id, req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.status(201).json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = new UserController();
