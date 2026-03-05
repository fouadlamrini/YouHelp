const Friend = require("../models/Friend");
const FriendRequest = require("../models/FriendRequest");
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
  /** Envoyer une invitation (crée une FriendRequest) */
  async add(req, res) {
    try {
      const me = req.user.id;
      const { userId } = req.body;
      if (!userId || userId === me) {
        return res.status(400).json({ message: "Invalid userId" });
      }
      const toUser = await User.findById(userId).select("_id status");
      if (!toUser) return res.status(404).json({ message: "User not found" });
      if (toUser.status !== "active") {
        return res.status(400).json({ message: "You can only send invitations to active users" });
      }
      const [id1, id2] = normalizePair(me, userId);
      const alreadyFriends = await Friend.findOne({
        $or: [{ user1: id1, user2: id2 }, { user1: id2, user2: id1 }],
      });
      if (alreadyFriends) return res.status(400).json({ message: "Already friends" });
      const existingRequest = await FriendRequest.findOne({
        fromUser: { $in: [me, userId] },
        toUser: { $in: [me, userId] },
        status: "pending",
      });
      if (existingRequest) {
        return res.status(400).json({ message: "Request already sent or received" });
      }
      const request = await FriendRequest.create({ fromUser: me, toUser: userId });
      const populated = await FriendRequest.findById(request._id)
        .populate("fromUser", "name email profilePicture")
        .populate("toUser", "name email profilePicture");
      res.status(201).json({ success: true, data: populated });
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
        .populate({
          path: "user1",
          select: "name email profilePicture",
          populate: [{ path: "campus", select: "name" }, { path: "class", select: "name" }],
        })
        .populate({
          path: "user2",
          select: "name email profilePicture",
          populate: [{ path: "campus", select: "name" }, { path: "class", select: "name" }],
        });
      const friends = docs.map((d) => (d.user1._id.toString() === me ? d.user2 : d.user1));
      res.json({ success: true, data: friends });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = { friendController: new FriendController(), areFriends };
