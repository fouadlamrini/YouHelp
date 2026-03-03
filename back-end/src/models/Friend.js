const mongoose = require("mongoose");

const friendSchema = new mongoose.Schema(
  {
    user1: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    user2: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

friendSchema.index({ user1: 1, user2: 1 }, { unique: true });
friendSchema.index({ user2: 1, user1: 1 });

module.exports = mongoose.model("Friend", friendSchema);
