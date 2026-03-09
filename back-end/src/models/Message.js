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
    isSystem: { type: Boolean, default: false },
    systemType: { type: String }, // "call"
    callPayload: {
      callKind: { type: String }, // "video" | "voice"
      callStatus: { type: String }, // "missed" | "ended"
      durationSec: { type: Number },
      direction: { type: String }, // "incoming" | "outgoing"
    },
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
