const mongoose = require("mongoose");

const callHistorySchema = new mongoose.Schema(
  {
    callId: { type: String, required: true, unique: true, index: true },
    caller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    callee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["video", "voice"], required: true },
    status: {
      type: String,
      enum: ["ringing", "in_progress", "terminated", "no_answer", "busy", "rejected", "failed"],
      required: true,
      default: "ringing",
      index: true,
    },
    startedAt: { type: Date, default: Date.now },
    answeredAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    durationSec: { type: Number, default: 0 },
    endedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CallHistory", callHistorySchema);
