const mongoose = require("mongoose");

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
    return next(new Error("Engagement must have either post or knowledge"));
  }
  if (this.post && this.knowledge) {
    return next(new Error("Engagement cannot have both post and knowledge"));
  }
  return next();
});

engagementSchema.index(
  { type: 1, user: 1, post: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { type: "reaction", post: { $ne: null } },
  }
);


engagementSchema.index(
  { type: 1, user: 1, knowledge: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { type: "reaction", knowledge: { $ne: null } },
  }
);

module.exports = mongoose.model("Engagement", engagementSchema);
