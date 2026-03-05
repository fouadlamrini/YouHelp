const FriendRequest = require("../models/FriendRequest");
const Friend = require("../models/Friend");
const User = require("../models/User");

function normalizePair(a, b) {
  return [a.toString(), b.toString()].sort();
}

class FriendRequestController {
  /** Envoyer une invitation (à un user actif) */
  async send(req, res) {
    try {
      const me = req.user.id;
      const { toUserId } = req.body;
      if (!toUserId || toUserId === me) {
        return res.status(400).json({ message: "Invalid user" });
      }
      const toUser = await User.findById(toUserId).select("_id status");
      if (!toUser) return res.status(404).json({ message: "User not found" });
      if (toUser.status !== "active") {
        return res.status(400).json({ message: "You can only send invitations to active users" });
      }
      const [id1, id2] = normalizePair(me, toUserId);
      const alreadyFriends = await Friend.findOne({
        $or: [{ user1: id1, user2: id2 }, { user1: id2, user2: id1 }],
      });
      if (alreadyFriends) return res.status(400).json({ message: "Already friends" });
      const existing = await FriendRequest.findOne({
        fromUser: { $in: [me, toUserId] },
        toUser: { $in: [me, toUserId] },
        status: "pending",
      });
      if (existing) return res.status(400).json({ message: "Request already sent or received" });
      const request = await FriendRequest.create({ fromUser: me, toUser: toUserId });
      const populated = await FriendRequest.findById(request._id)
        .populate("fromUser", "name email profilePicture")
        .populate("toUser", "name email profilePicture");
      res.status(201).json({ success: true, data: populated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  /** Liste des demandes reçues (pending) pour la dropdown invitations */
  async listReceived(req, res) {
    try {
      const me = req.user.id;
      const list = await FriendRequest.find({ toUser: me, status: "pending" })
        .populate("fromUser", "name email profilePicture")
        .sort({ createdAt: -1 });
      res.json({ success: true, data: list });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  /** Accepter une demande → créer Friend, supprimer la demande */
  async accept(req, res) {
    try {
      const me = req.user.id;
      const { id } = req.params;
      const request = await FriendRequest.findById(id).populate("fromUser toUser");
      if (!request) return res.status(404).json({ message: "Request not found" });
      if (request.toUser._id.toString() !== me) {
        return res.status(403).json({ message: "Forbidden" });
      }
      if (request.status !== "pending") {
        return res.status(400).json({ message: "Request already handled" });
      }
      const [id1, id2] = normalizePair(request.fromUser._id, request.toUser._id);
      await Friend.create({ user1: id1, user2: id2 });
      await FriendRequest.findByIdAndDelete(id);
      res.json({ success: true, message: "Friend added" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  /** Refuser une demande */
  async reject(req, res) {
    try {
      const me = req.user.id;
      const { id } = req.params;
      const request = await FriendRequest.findById(id);
      if (!request) return res.status(404).json({ message: "Request not found" });
      if (request.toUser.toString() !== me) return res.status(403).json({ message: "Forbidden" });
      await FriendRequest.findByIdAndUpdate(id, { status: "rejected" });
      res.json({ success: true, message: "Request rejected" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  /** Utilisateurs actifs à qui on peut envoyer une invitation (exclut self, amis, déjà demandé) */
  async availableUsers(req, res) {
    try {
      const me = req.user.id;
      const friends = await Friend.find({ $or: [{ user1: me }, { user2: me }] });
      const friendIds = friends.map((d) =>
        d.user1.toString() === me ? d.user2.toString() : d.user1.toString()
      );
      const pendingFromMe = await FriendRequest.find({ fromUser: me, status: "pending" }).distinct(
        "toUser"
      );
      const pendingToMe = await FriendRequest.find({ toUser: me, status: "pending" }).distinct(
        "fromUser"
      );
      const exclude = [me, ...friendIds, ...pendingFromMe.map(String), ...pendingToMe.map(String)];
      const users = await User.find({
        _id: { $nin: exclude },
        status: "active",
      })
        .select("name email profilePicture campus class level")
        .populate("campus", "name")
        .populate("class", "name")
        .populate("level", "name")
        .limit(50)
        .lean();
      res.json({ success: true, data: users });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new FriendRequestController();
