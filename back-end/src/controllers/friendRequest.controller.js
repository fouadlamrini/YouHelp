const friendRequestService = require("../services/friendRequest.service");
const Notification = require("../models/Notification");

class FriendRequestController {
  send = async (req, res) => {
    try {
      const result = await friendRequestService.send(req.user.id, req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      const friendRequest = result.data;

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

      // Créer une notification pour l'expéditeur : "X a accepté votre invitation"
      try {
        if (accepted?.fromUser?._id && accepted?.toUser?._id) {
          const actor = accepted.toUser;
          const recipientId = accepted.fromUser._id;
          const actorName = actor.name || "Un utilisateur";
          await Notification.create({
            recipient: recipientId,
            actor: actor._id,
            type: "friend_request_accepted",
            message: `${actorName} a accepté votre invitation.`,
            relatedUser: actor._id,
            link: "/profile/friends",
          });
        }
      } catch (e) {
        // ignorer les erreurs de notification pour ne pas casser l'acceptation
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
