const friendRequestService = require("../services/friendRequest.service");

class FriendRequestController {
  send = async (req, res) => {
    try {
      const result = await friendRequestService.send(req.user.id, req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      const friendRequest = result.data;

      // Real-time notification to target user via socket, if available
      try {
        const emitToUser = req.app.get("emitToUser");
        if (emitToUser && friendRequest?.toUser?._id) {
          emitToUser(friendRequest.toUser._id.toString(), "friend-request-received", {
            requestId: friendRequest._id,
            fromUser: {
              _id: friendRequest.fromUser?._id,
              name: friendRequest.fromUser?.name,
              email: friendRequest.fromUser?.email,
              profilePicture: friendRequest.fromUser?.profilePicture,
            },
          });
        }
      } catch (e) {
        // ignore socket errors
      }

      return res.status(201).json({ success: true, data: friendRequest });
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

  listSent = async (req, res) => {
    try {
      const result = await friendRequestService.listSent(req.user.id);
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
      const accepted = result.data;

      // Notifier les deux utilisateurs que la liste d'amis a changé (temps réel)
      try {
        const emitToUser = req.app.get("emitToUser");
        if (emitToUser && accepted?.fromUser?._id && accepted?.toUser?._id) {
          const fromId = accepted.fromUser._id.toString();
          const toId = accepted.toUser._id.toString();
          emitToUser(fromId, "friends-updated", { with: toId });
          emitToUser(toId, "friends-updated", { with: fromId });
        }
      } catch (e) {
        // ignore socket errors
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
      const request = result.data;

      // Notify sender that the request was rejected (realtime update)
      try {
        const emitToUser = req.app.get("emitToUser");
        if (emitToUser && request?.fromUser?._id) {
          emitToUser(request.fromUser._id.toString(), "friend-request-updated", {
            requestId: request._id,
            status: request.status,
          });
        }
      } catch (e) {
        // ignore socket errors
      }

      return res.json({ success: true, message: "Request rejected" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  cancelSent = async (req, res) => {
    try {
      const result = await friendRequestService.cancelSent(req.user.id, req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, message: "Request cancelled" });
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
