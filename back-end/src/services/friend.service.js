const Friend = require("../models/Friend");
const FriendRequest = require("../models/FriendRequest");
const User = require("../models/User");
const { isUserOnline, getLastSeen } = require("../config/socket");

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

async function getMyFriendIds(userId) {
  const docs = await Friend.find({ $or: [{ user1: userId }, { user2: userId }] }).select("user1 user2");
  return docs.map((d) => (d.user1.toString() === userId.toString() ? d.user2.toString() : d.user1.toString()));
}

async function add(me, body) {
  const { userId } = body;
  if (userId === me) return { error: { status: 400, message: "Invalid userId" } };
  const toUser = await User.findById(userId).select("_id status");
  if (!toUser) return { error: { status: 404, message: "User not found" } };
  if (toUser.status !== "active") {
    return { error: { status: 400, message: "You can only send invitations to active users" } };
  }
  const [id1, id2] = normalizePair(me, userId);
  const alreadyFriends = await Friend.findOne({
    $or: [{ user1: id1, user2: id2 }, { user1: id2, user2: id1 }],
  });
  if (alreadyFriends) return { error: { status: 400, message: "Already friends" } };
  const existingRequest = await FriendRequest.findOne({
    fromUser: { $in: [me, userId] },
    toUser: { $in: [me, userId] },
    status: "pending",
  });
  if (existingRequest) {
    return { error: { status: 400, message: "Request already sent or received" } };
  }
  const request = await FriendRequest.create({ fromUser: me, toUser: userId });
  const populated = await FriendRequest.findById(request._id)
    .populate("fromUser", "name email profilePicture")
    .populate("toUser", "name email profilePicture");
  return { data: populated };
}

async function remove(me, targetUserId) {
  const doc = await Friend.findOneAndDelete({
    $or: [
      { user1: me, user2: targetUserId },
      { user1: targetUserId, user2: me },
    ],
  });
  if (!doc) return { error: { status: 404, message: "Friendship not found" } };
  return {
    data: {
      user1: me,
      user2: targetUserId,
    },
  };
}

async function list(me) {
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
  const friends = docs
    .map((d) => (d && d.user1 && d.user2 ? (d.user1._id.toString() === me ? d.user2 : d.user1) : null))
    .filter((u) => !!u);
  const enriched = friends.map((u) => {
    const plain = u.toObject();
    if (!plain || !plain._id) return plain;
    const id = plain._id.toString();
    plain.online = isUserOnline(id);
    const ls = getLastSeen(id);
    plain.lastSeen = ls ? (ls.toISOString ? ls.toISOString() : ls) : null;
    return plain;
  });
  return { data: enriched };
}

module.exports = {
  areFriends,
  getMyFriendIds,
  add,
  remove,
  list,
};
