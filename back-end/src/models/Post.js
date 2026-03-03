const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  reactionCount: { type: Number, default: 0, min: 0 },
  shareCount: { type: Number, default: 0, min: 0 },
  // Statut du post: true si le post a une solution, false sinon
  isSolved: { type: Boolean, default: false },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
  media: [
    {
      url: { type: String, required: true },
      type: { type: String, required: true } 
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
