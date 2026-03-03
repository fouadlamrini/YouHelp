const mongoose = require("mongoose");

/**
 * One model for both reaction (like) and share on Post or Knowledge.
 * - type: 'reaction' | 'share'
 * - user: who did the action
 * - post OR knowledge: target (one required)
 */
const engagementSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["reaction", "share"], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
    knowledge: { type: mongoose.Schema.Types.ObjectId, ref: "Knowledge", default: null },
  },
  { timestamps: true }
);

engagementSchema.pre("validate", function (next) {
  if (!this.post && !this.knowledge) {
    next(new Error("Engagement must have either post or knowledge"));
  }
  if (this.post && this.knowledge) {
    next(new Error("Engagement cannot have both post and knowledge"));
  }
  next();
});

engagementSchema.index({ type: 1, user: 1, post: 1 }, { unique: true, sparse: true });
engagementSchema.index({ type: 1, user: 1, knowledge: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Engagement", engagementSchema);
