const classJoinRequestService = require("../services/classJoinRequest.service");

class ClassJoinRequestController {
  create = async (req, res) => {
    try {
      const result = await classJoinRequestService.create(req.user.id, req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.status(201).json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      if (err.code === 11000) return res.status(400).json({ message: "Request already exists" });
      return res.status(500).json({ message: "Server error" });
    }
  };

  getRequestsForMyClass = async (req, res) => {
    try {
      const result = await classJoinRequestService.getRequestsForMyClass(req.user.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  accept = async (req, res) => {
    try {
      const result = await classJoinRequestService.accept(req.user.id, req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, message: "User accepted into class" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  reject = async (req, res) => {
    try {
      const result = await classJoinRequestService.reject(req.user.id, req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, message: "Request rejected" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = new ClassJoinRequestController();
