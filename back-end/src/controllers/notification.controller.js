const notificationService = require("../services/notification.service");

async function getMine(req, res) {
  try {
    const result = await notificationService.getMine(req.user.id);
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }
    return res.json({ success: true, data: result.data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function markAsRead(req, res) {
  try {
    const result = await notificationService.markAsRead(req.user.id, req.params.id);
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }
    return res.json({ success: true, data: result.data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function markAllAsRead(req, res) {
  try {
    await notificationService.markAllAsRead(req.user.id);
    return res.json({ success: true, message: "Toutes les notifications sont marquées comme lues." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getMine, markAsRead, markAllAsRead };
