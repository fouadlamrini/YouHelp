const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, default: "" },
    attachment: {
      url: { type: String },
      type: { type: String }, // "image" | "video" | "audio" | "file"
      originalName: { type: String },
    },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, sender: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
