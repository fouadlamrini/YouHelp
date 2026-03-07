const friendRequestService = require("../services/friendRequest.service");

class FriendRequestController {
  send = async (req, res) => {
    try {
      const result = await friendRequestService.send(req.user.id, req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.status(201).json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  listReceived = async (req, res) => {
    try {
      const result = await friendRequestService.listReceived(req.user.id);
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
      const result = await friendRequestService.accept(req.user.id, req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, message: "Friend added" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  reject = async (req, res) => {
    try {
      const result = await friendRequestService.reject(req.user.id, req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, message: "Request rejected" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  availableUsers = async (req, res) => {
    try {
      const result = await friendRequestService.availableUsers(req.user.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = new FriendRequestController();
