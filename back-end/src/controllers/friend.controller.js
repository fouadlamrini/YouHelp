const friendService = require("../services/friend.service");

// Re-export for post.controller, knowledge.controller (they use areFriends, getMyFriendIds)
const areFriends = friendService.areFriends;
const getMyFriendIds = friendService.getMyFriendIds;

class FriendController {
  add = async (req, res) => {
    try {
      const result = await friendService.add(req.user.id, req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.status(201).json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  remove = async (req, res) => {
    try {
      const result = await friendService.remove(req.user.id, req.params.userId);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      const removed = result.data;

      // Notifier les deux utilisateurs que la liste d'amis a changé (temps réel)
      try {
        const emitToUser = req.app.get("emitToUser");
        if (emitToUser && removed?.user1 && removed?.user2) {
          const user1 = removed.user1.toString();
          const user2 = removed.user2.toString();
          emitToUser(user1, "friends-updated", { with: user2 });
          emitToUser(user2, "friends-updated", { with: user1 });
        }
      } catch (e) {
        // ignore socket errors
      }

      return res.json({ success: true, message: "Friend removed" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  list = async (req, res) => {
    try {
      const result = await friendService.list(req.user.id);
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

module.exports = {
  friendController: new FriendController(),
  areFriends,
  getMyFriendIds,
};
