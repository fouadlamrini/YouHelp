const mongoose = require("mongoose");

// Schema pour les connaissances partagées par les utilisateurs
// - Similaire à Post: contenu, catégorie, sous-catégorie, médias
// - Supporte les commentaires, réactions et partages
const knowledgeSchema = new mongoose.Schema(
  {
    // Contenu/description de la connaissance
    content: { type: String, required: true },
    
    // Auteur de la connaissance
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    // Catégorie de la connaissance
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    
    // Sous-catégorie de la connaissance
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" },
    
    // Médias associés (images, vidéos, fichiers)
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, required: true }, // 'image' | 'video' | 'file' | 'pdf'
      },
    ],

    // Commentaires sur la connaissance
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    
    reactionCount: { type: Number, default: 0, min: 0 },
    shareCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Knowledge", knowledgeSchema);
