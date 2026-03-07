const FriendRequest = require("../models/FriendRequest");
const Friend = require("../models/Friend");
const User = require("../models/User");

function normalizePair(a, b) {
  return [a.toString(), b.toString()].sort();
}

async function send(me, body) {
  const { toUserId } = body;
  if (toUserId === me) return { error: { status: 400, message: "Invalid user" } };
  const toUser = await User.findById(toUserId).select("_id status");
  if (!toUser) return { error: { status: 404, message: "User not found" } };
  if (toUser.status !== "active") {
    return { error: { status: 400, message: "You can only send invitations to active users" } };
  }
  const [id1, id2] = normalizePair(me, toUserId);
  const alreadyFriends = await Friend.findOne({
    $or: [{ user1: id1, user2: id2 }, { user1: id2, user2: id1 }],
  });
  if (alreadyFriends) return { error: { status: 400, message: "Already friends" } };
  const existing = await FriendRequest.findOne({
    fromUser: { $in: [me, toUserId] },
    toUser: { $in: [me, toUserId] },
    status: "pending",
  });
  if (existing) return { error: { status: 400, message: "Request already sent or received" } };
  const request = await FriendRequest.create({ fromUser: me, toUser: toUserId });
  const populated = await FriendRequest.findById(request._id)
    .populate("fromUser", "name email profilePicture")
    .populate("toUser", "name email profilePicture");
  return { data: populated };
}

async function listReceived(me) {
  const list = await FriendRequest.find({ toUser: me, status: "pending" })
    .populate("fromUser", "name email profilePicture")
    .sort({ createdAt: -1 });
  return { data: list };
}

async function accept(me, requestId) {
  const request = await FriendRequest.findById(requestId).populate("fromUser toUser");
  if (!request) return { error: { status: 404, message: "Request not found" } };
  if (request.toUser._id.toString() !== me) {
    return { error: { status: 403, message: "Forbidden" } };
  }
  if (request.status !== "pending") {
    return { error: { status: 400, message: "Request already handled" } };
  }
  const [id1, id2] = normalizePair(request.fromUser._id, request.toUser._id);
  await Friend.create({ user1: id1, user2: id2 });
  await FriendRequest.findByIdAndDelete(requestId);
  return { ok: true };
}

async function reject(me, requestId) {
  const request = await FriendRequest.findById(requestId);
  if (!request) return { error: { status: 404, message: "Request not found" } };
  if (request.toUser.toString() !== me) return { error: { status: 403, message: "Forbidden" } };
  await FriendRequest.findByIdAndUpdate(requestId, { status: "rejected" });
  return { ok: true };
}

async function availableUsers(me) {
  const friends = await Friend.find({ $or: [{ user1: me }, { user2: me }] });
  const friendIds = friends.map((d) => (d.user1.toString() === me ? d.user2.toString() : d.user1.toString()));
  const pendingFromMe = await FriendRequest.find({ fromUser: me, status: "pending" }).distinct("toUser");
  const pendingToMe = await FriendRequest.find({ toUser: me, status: "pending" }).distinct("fromUser");
  const exclude = [me, ...friendIds, ...pendingFromMe.map(String), ...pendingToMe.map(String)];
  const users = await User.find({ _id: { $nin: exclude }, status: "active" })
    .select("name email profilePicture campus class level")
    .populate("campus", "name")
    .populate("class", "name")
    .populate("level", "name")
    .limit(50)
    .lean();
  return { data: users };
}

module.exports = {
  send,
  listReceived,
  accept,
  reject,
  availableUsers,
};
