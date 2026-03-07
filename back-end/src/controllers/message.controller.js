const Message = require("../models/Message");
const User = require("../models/User");
const { areFriends } = require("./friend.controller");

class MessageController {
  async send(req, res) {
    try {
      const receiverId = req.body.receiverId;
      const content = (req.body.content || "").trim();
      const hasFile = req.file && req.file.path;

      if (!content && !hasFile) {
        return res.status(400).json({ message: "content or attachment required" });
      }

      const receiver = await User.findById(receiverId).select("_id");
      if (!receiver) return res.status(404).json({ message: "Receiver not found" });
      if (receiverId === req.user.id) {
        return res.status(400).json({ message: "Cannot send message to yourself" });
      }
      const friends = await areFriends(req.user.id, receiverId);
      if (!friends) {
        return res.status(403).json({ message: "You can only message your friends" });
      }

      let attachment = null;
      if (hasFile) {
        const file = req.file;
        const folder = file.path.includes("images") ? "images" : file.path.includes("videos") ? "videos" : file.path.includes("audio") ? "audio" : "files";
        const type = file.mimetype.startsWith("image") ? "image" : file.mimetype.startsWith("video") ? "video" : file.mimetype.startsWith("audio") ? "audio" : "file";
        attachment = {
          url: `/uploads/${folder}/${file.filename}`,
          type,
          originalName: file.originalname || file.filename,
        };
      }

      const message = await Message.create({
        sender: req.user.id,
        receiver: receiverId,
        content: content || "",
        ...(attachment && { attachment }),
      });
      const populated = await Message.findById(message._id)
        .populate("sender", "name email")
        .populate("receiver", "name email");
      const emitToUser = req.app.get("emitToUser");
      if (emitToUser) emitToUser(receiverId, "message", populated);
      res.status(201).json({ success: true, data: populated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getConversation(req, res) {
    try {
      const { userId } = req.params;
      const me = req.user.id;
      const messages = await Message.find({
        $or: [
          { sender: me, receiver: userId },
          { sender: userId, receiver: me },
        ],
      })
        .sort({ createdAt: 1 })
        .populate("sender", "name email")
        .populate("receiver", "name email");
      await Message.updateMany(
        { sender: userId, receiver: me, readAt: null },
        { readAt: new Date() }
      );
      res.json({ success: true, data: messages });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getConversations(req, res) {
    try {
      const me = req.user.id;
      const sent = await Message.find({ sender: me }).distinct("receiver");
      const received = await Message.find({ receiver: me }).distinct("sender");
      const partnerIds = [...new Set([...sent.map(String), ...received.map(String)])];
      const partners = await User.find({ _id: { $in: partnerIds } })
        .select("name email profilePicture")
        .lean();
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
          return {
            user: p,
            lastMessage: last || null,
            unread: !!unread,
          };
        })
      );
      list.sort((a, b) => {
        const tA = a.lastMessage?.createdAt || 0;
        const tB = b.lastMessage?.createdAt || 0;
        return new Date(tB) - new Date(tA);
      });
      res.json({ success: true, data: list });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async deleteMessage(req, res) {
    try {
      const { id } = req.params;
      const message = await Message.findById(id);
      if (!message) return res.status(404).json({ message: "Message not found" });
      if (message.sender.toString() !== req.user.id) {
        return res.status(403).json({ message: "Can only delete your own messages" });
      }
      const receiverId = message.receiver.toString();
      await Message.findByIdAndDelete(id);
      const emitToUser = req.app.get("emitToUser");
      if (emitToUser) emitToUser(receiverId, "message-deleted", { messageId: id });
      res.json({ success: true, message: "Message deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async toggleReaction(req, res) {
    try {
      const { id } = req.params;
      const { emoji } = req.body;
      if (!emoji || typeof emoji !== "string" || emoji.length > 8) {
        return res.status(400).json({ message: "emoji required (string, max 8 chars)" });
      }
      const message = await Message.findById(id);
      if (!message) return res.status(404).json({ message: "Message not found" });
      const me = req.user.id;
      const partnerId = message.sender.toString() === me ? message.receiver.toString() : message.sender.toString();
      const friends = await areFriends(me, partnerId);
      if (!friends) return res.status(403).json({ message: "Can only react in friend conversation" });
      const reactions = message.reactions || [];
      const myIndex = reactions.findIndex((r) => r.user && r.user.toString() === me);
      if (myIndex >= 0 && reactions[myIndex].emoji === emoji) {
        reactions.splice(myIndex, 1);
      } else {
        if (myIndex >= 0) reactions.splice(myIndex, 1);
        reactions.push({ user: me, emoji: emoji.trim() });
      }
      message.reactions = reactions;
      await message.save();
      const updated = await Message.findById(id)
        .populate("sender", "name email")
        .populate("receiver", "name email")
        .populate("reactions.user", "name");
      const emitToUser = req.app.get("emitToUser");
      if (emitToUser) {
        emitToUser(partnerId, "message-reaction", { message: updated });
      }
      res.json({ success: true, data: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new MessageController();
