const Notification = require("../models/Notification");

async function getMine(req, res) {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("actor", "name profilePicture")
      .populate("relatedUser", "name email")
      .lean();
    res.json({ success: true, data: notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function markAsRead(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const notif = await Notification.findOne({ _id: id, recipient: userId });
    if (!notif) return res.status(404).json({ message: "Notification not found" });
    notif.read = true;
    await notif.save();
    res.json({ success: true, data: notif });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function markAllAsRead(req, res) {
  try {
    const userId = req.user.id;
    await Notification.updateMany({ recipient: userId, read: false }, { read: true });
    res.json({ success: true, message: "Toutes les notifications sont marquées comme lues." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getMine, markAsRead, markAllAsRead };
