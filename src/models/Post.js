const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  Reaction: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  partage: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Compteur de partages: nombre total de fois que ce post a été partagé
  shareCount: { type: Number, default: 0, min: 0 },
  tags: [{ type: String }],
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
