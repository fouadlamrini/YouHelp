const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, default: "" },
    attachment: {
      url: { type: String },
      type: { type: String }, // "image" | "video" | "file"
      originalName: { type: String },
    },
    readAt: { type: Date, default: null },
    // Legacy call fields are intentionally kept for safe reads of old documents.
    isSystem: { type: Boolean, default: false },
    systemType: { type: String },
    callPayload: { type: mongoose.Schema.Types.Mixed, default: undefined },
    reactions: [
      { user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, emoji: { type: String } },
    ],
    hiddenFor: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], default: [] },
  },
  { timestamps: true }
);

messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, sender: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
