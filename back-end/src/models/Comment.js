const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, required: true }, // 'image' | 'video' | 'file'
      },
    ],
  },
  { timestamps: true }
);

commentSchema.pre("validate", function (next) {
  if (!this.post) {
    next(new Error("Comment must have a post"));
  } else {
    next();
  }
});

module.exports = mongoose.model("Comment", commentSchema);
