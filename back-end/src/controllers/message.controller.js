const messageService = require("../services/message.service");

class MessageController {
  async send(req, res) {
    try {
      const emitToUser = req.app.get("emitToUser");
      const result = await messageService.send(req.user.id, req.body, req.file, emitToUser);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.status(201).json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async getConversation(req, res) {
    try {
      const result = await messageService.getConversation(req.user.id, req.params.userId);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async getConversations(req, res) {
    try {
      const result = await messageService.getConversations(req.user.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async deleteMessage(req, res) {
    try {
      const emitToUser = req.app.get("emitToUser");
      const result = await messageService.deleteMessage(req.user.id, req.params.id, emitToUser);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, message: "Message deleted" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async toggleReaction(req, res) {
    try {
      const emitToUser = req.app.get("emitToUser");
      const result = await messageService.toggleReaction(req.user.id, req.params.id, req.body, emitToUser);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new MessageController();
