const Message = require("../models/Message");
const User = require("../models/User");

class MessageController {
  async send(req, res) {
    try {
      const { receiverId, content } = req.body;
      if (!receiverId || !content?.trim()) {
        return res.status(400).json({ message: "receiverId and content required" });
      }
      const receiver = await User.findById(receiverId).select("_id");
      if (!receiver) return res.status(404).json({ message: "Receiver not found" });
      if (receiverId === req.user.id) {
        return res.status(400).json({ message: "Cannot send message to yourself" });
      }
      const message = await Message.create({
        sender: req.user.id,
        receiver: receiverId,
        content: content.trim(),
      });
      const populated = await Message.findById(message._id)
        .populate("sender", "name email")
        .populate("receiver", "name email");
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
            .select("content createdAt readAt")
            .lean();
          return {
            user: p,
            lastMessage: last || null,
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
      await Message.findByIdAndDelete(id);
      res.json({ success: true, message: "Message deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new MessageController();
