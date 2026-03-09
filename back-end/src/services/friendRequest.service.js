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
  let request;
  try {
    request = await FriendRequest.create({ fromUser: me, toUser: toUserId });
  } catch (err) {
    // Gérer le cas où une ancienne demande (rejetée / acceptée) existe déjà à cause de l'index unique
    if (err && err.code === 11000) {
      const existingPair = await FriendRequest.findOne({
        $or: [
          { fromUser: me, toUser: toUserId },
          { fromUser: toUserId, toUser: me },
        ],
      });
      if (!existingPair) {
        throw err;
      }
      if (existingPair.status === "rejected") {
        existingPair.fromUser = me;
        existingPair.toUser = toUserId;
        existingPair.status = "pending";
        await existingPair.save();
        request = existingPair;
      } else {
        return { error: { status: 400, message: "Request already handled" } };
      }
    } else {
      throw err;
    }
  }
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

async function listSent(me) {
  const list = await FriendRequest.find({ fromUser: me, status: "pending" })
    .populate("toUser", "name email profilePicture campus class level")
    .sort({ createdAt: -1 })
    .lean();
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
  return {
    data: {
      fromUser: request.fromUser,
      toUser: request.toUser,
    },
  };
}

async function reject(me, requestId) {
  const request = await FriendRequest.findById(requestId).populate("fromUser toUser");
  if (!request) return { error: { status: 404, message: "Request not found" } };
  const toId = request.toUser?._id
    ? request.toUser._id.toString()
    : request.toUser.toString();
  if (toId !== me) return { error: { status: 403, message: "Forbidden" } };
  request.status = "rejected";
  await request.save();
  return { data: request };
}

async function cancelSent(me, requestId) {
  const request = await FriendRequest.findById(requestId);
  if (!request) return { error: { status: 404, message: "Request not found" } };
  if (request.fromUser.toString() !== me) return { error: { status: 403, message: "Forbidden" } };
  if (request.status !== "pending") {
    return { error: { status: 400, message: "Request already handled" } };
  }
  await FriendRequest.findByIdAndDelete(requestId);
  return { ok: true };
}

async function availableUsers(me) {
  const friends = await Friend.find({ $or: [{ user1: me }, { user2: me }] });
  const friendIds = friends.map((d) => (d.user1.toString() === me ? d.user2.toString() : d.user1.toString()));
  const pendingFromMe = await FriendRequest.find({ fromUser: me, status: "pending" }).distinct("toUser");
  const pendingToMe = await FriendRequest.find({ toUser: me, status: "pending" }).distinct("fromUser");
  const exclude = [me, ...friendIds, ...pendingFromMe.map(String), ...pendingToMe.map(String)];
  const users = await User.find({ _id: { $nin: exclude }, status: "active" })
    .select("name email profilePicture campus class level role")
    .populate("campus", "name")
    .populate("class", "name")
    .populate("level", "name")
    .populate("role", "name")
    .limit(50)
    .lean();
  return { data: users };
}

module.exports = {
  send,
  listReceived,
  listSent,
  accept,
  reject,
  cancelSent,
  availableUsers,
};
