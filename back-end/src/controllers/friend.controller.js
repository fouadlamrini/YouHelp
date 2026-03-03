const Friend = require("../models/Friend");
const User = require("../models/User");

function normalizePair(a, b) {
  return [a.toString(), b.toString()].sort();
}

async function areFriends(userId1, userId2) {
  const [id1, id2] = normalizePair(userId1, userId2);
  const doc = await Friend.findOne({
    $or: [
      { user1: id1, user2: id2 },
      { user1: id2, user2: id1 },
    ],
  });
  return !!doc;
}

class FriendController {
  async add(req, res) {
    try {
      const me = req.user.id;
      const { userId } = req.body;
      if (!userId || userId === me) {
        return res.status(400).json({ message: "Invalid userId" });
      }
      const other = await User.findById(userId).select("_id");
      if (!other) return res.status(404).json({ message: "User not found" });
      const [id1, id2] = normalizePair(me, userId);
      const existing = await Friend.findOne({
        $or: [
          { user1: id1, user2: id2 },
          { user1: id2, user2: id1 },
        ],
      });
      if (existing) return res.status(400).json({ message: "Already friends" });
      await Friend.create({ user1: id1, user2: id2 });
      const list = await Friend.find({ $or: [{ user1: me }, { user2: me }] })
        .populate("user1", "name email")
        .populate("user2", "name email");
      res.status(201).json({ success: true, data: list });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async remove(req, res) {
    try {
      const me = req.user.id;
      const { userId } = req.params;
      const doc = await Friend.findOneAndDelete({
        $or: [
          { user1: me, user2: userId },
          { user1: userId, user2: me },
        ],
      });
      if (!doc) return res.status(404).json({ message: "Friendship not found" });
      res.json({ success: true, message: "Friend removed" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async list(req, res) {
    try {
      const me = req.user.id;
      const docs = await Friend.find({ $or: [{ user1: me }, { user2: me }] })
        .populate("user1", "name email profilePicture")
        .populate("user2", "name email profilePicture");
      const friends = docs.map((d) => (d.user1._id.toString() === me ? d.user2 : d.user1));
      res.json({ success: true, data: friends });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = { friendController: new FriendController(), areFriends };
