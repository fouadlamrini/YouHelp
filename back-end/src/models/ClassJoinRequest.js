const mongoose = require("mongoose");

const classJoinRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

classJoinRequestSchema.index({ user: 1, class: 1 }, { unique: true });

module.exports = mongoose.model("ClassJoinRequest", classJoinRequestSchema);
