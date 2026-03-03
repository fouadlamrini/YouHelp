const mongoose = require("mongoose");

const workshopRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workshop: { type: mongoose.Schema.Types.ObjectId, ref: "Workshop", required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

workshopRequestSchema.index({ user: 1, workshop: 1 }, { unique: true });

module.exports = mongoose.model("WorkshopRequest", workshopRequestSchema);
