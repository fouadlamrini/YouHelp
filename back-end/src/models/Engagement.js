const mongoose = require("mongoose");

const engagementSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["reaction", "share"], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: true }
);

engagementSchema.index(
  { type: 1, user: 1, post: 1 },
  {
    unique: true,
    partialFilterExpression: { type: "reaction" },
  }
);

module.exports = mongoose.model("Engagement", engagementSchema);
