const Message = require("../models/Message");
const User = require("../models/User");
const { areFriends } = require("./friend.service");

function buildAttachment(file) {
  if (!file || !file.path) return null;
  const folder = file.path.includes("images") ? "images" : file.path.includes("videos") ? "videos" : file.path.includes("audio") ? "audio" : "files";
  const type = file.mimetype.startsWith("image") ? "image" : file.mimetype.startsWith("video") ? "video" : file.mimetype.startsWith("audio") ? "audio" : "file";
  return {
    url: `/uploads/${folder}/${file.filename}`,
    type,
    originalName: file.originalname || file.filename,
  };
}

async function send(senderId, body, file, emitToUser) {
  const receiverId = body.receiverId;
  const content = (body.content || "").trim();
  const hasFile = file && file.path;
  if (!content && !hasFile) return { error: { status: 400, message: "content or attachment required" } };
  const receiver = await User.findById(receiverId).select("_id");
  if (!receiver) return { error: { status: 404, message: "Receiver not found" } };
  if (receiverId === senderId) return { error: { status: 400, message: "Cannot send message to yourself" } };
  const friends = await areFriends(senderId, receiverId);
  if (!friends) return { error: { status: 403, message: "You can only message your friends" } };
  const attachment = hasFile ? buildAttachment(file) : null;
  const message = await Message.create({
    sender: senderId,
    receiver: receiverId,
    content: content || "",
    ...(attachment && { attachment }),
  });
  const populated = await Message.findById(message._id)
    .populate("sender", "name email")
    .populate("receiver", "name email");
  if (emitToUser) emitToUser(receiverId, "message", populated);
  return { data: populated };
}

async function getConversation(me, partnerId) {
  const messages = await Message.find({
    $or: [
      { sender: me, receiver: partnerId },
      { sender: partnerId, receiver: me },
    ],
  })
    .sort({ createdAt: 1 })
    .populate("sender", "name email")
    .populate("receiver", "name email");
  await Message.updateMany({ sender: partnerId, receiver: me, readAt: null }, { readAt: new Date() });
  return { data: messages };
}

async function getConversations(me) {
  const sent = await Message.find({ sender: me }).distinct("receiver");
  const received = await Message.find({ receiver: me }).distinct("sender");
  const partnerIds = [...new Set([...sent.map(String), ...received.map(String)])];
  const partners = await User.find({ _id: { $in: partnerIds } }).select("name email profilePicture").lean();
  const list = await Promise.all(
    partners.map(async (p) => {
      const last = await Message.findOne({
        $or: [
          { sender: me, receiver: p._id },
          { sender: p._id, receiver: me },
        ],
      })
        .sort({ createdAt: -1 })
        .select("content attachment createdAt readAt receiver")
        .lean();
      const unread = last && last.receiver && last.receiver.toString() === me && !last.readAt;
      return { user: p, lastMessage: last || null, unread: !!unread };
    })
  );
  list.sort((a, b) => {
    const tA = a.lastMessage?.createdAt || 0;
    const tB = b.lastMessage?.createdAt || 0;
    return new Date(tB) - new Date(tA);
  });
  return { data: list };
}

async function deleteMessage(userId, messageId, emitToUser) {
  const message = await Message.findById(messageId);
  if (!message) return { error: { status: 404, message: "Message not found" } };
  if (message.sender.toString() !== userId) {
    return { error: { status: 403, message: "Can only delete your own messages" } };
  }
  const receiverId = message.receiver.toString();
  await Message.findByIdAndDelete(messageId);
  if (emitToUser) emitToUser(receiverId, "message-deleted", { messageId });
  return { ok: true };
}

async function toggleReaction(userId, messageId, body, emitToUser) {
  const { emoji } = body;
  if (!emoji || typeof emoji !== "string" || emoji.length > 8) {
    return { error: { status: 400, message: "emoji required (string, max 8 chars)" } };
  }
  const message = await Message.findById(messageId);
  if (!message) return { error: { status: 404, message: "Message not found" } };
  const partnerId = message.sender.toString() === userId ? message.receiver.toString() : message.sender.toString();
  const friends = await areFriends(userId, partnerId);
  if (!friends) return { error: { status: 403, message: "Can only react in friend conversation" } };
  const reactions = message.reactions || [];
  const myIndex = reactions.findIndex((r) => r.user && r.user.toString() === userId);
  if (myIndex >= 0 && reactions[myIndex].emoji === emoji) {
    reactions.splice(myIndex, 1);
  } else {
    if (myIndex >= 0) reactions.splice(myIndex, 1);
    reactions.push({ user: userId, emoji: emoji.trim() });
  }
  message.reactions = reactions;
  await message.save();
  const updated = await Message.findById(messageId)
    .populate("sender", "name email")
    .populate("receiver", "name email")
    .populate("reactions.user", "name");
  if (emitToUser) emitToUser(partnerId, "message-reaction", { message: updated });
  return { data: updated };
}

module.exports = {
  send,
  getConversation,
  getConversations,
  deleteMessage,
  toggleReaction,
};
