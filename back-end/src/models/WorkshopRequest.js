const mongoose = require("mongoose");

const workshopRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workshop: { type: mongoose.Schema.Types.ObjectId, ref: "Workshop", default: null },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

workshopRequestSchema.index({ user: 1, workshop: 1 }, { unique: true, sparse: true, partialFilterExpression: { workshop: { $ne: null } } });
workshopRequestSchema.index({ user: 1, post: 1 }, { unique: true, sparse: true, partialFilterExpression: { post: { $ne: null } } });

module.exports = mongoose.model("WorkshopRequest", workshopRequestSchema);
