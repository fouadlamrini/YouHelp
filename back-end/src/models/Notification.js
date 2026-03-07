const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["new_registration", "user_activated", "user_refused", "post_deleted_by_admin", "post_solved_by_admin"],
      required: true,
    },
    message: { type: String, required: true },
    relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    link: { type: String, default: "/users" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
