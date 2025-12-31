const mongoose = require("mongoose");

// Schema pour les connaissances partagées par les utilisateurs
// - Similaire à Post mais avec des champs supplémentaires: resource (URL), snippet (code)
// - Contient: titre, contenu, catégorie, sous-catégorie, médias, ressource, snippet de code
// - Supporte les commentaires, réactions et partages
const knowledgeSchema = new mongoose.Schema(
  {
    // Titre de la connaissance
    title: { type: String, required: true },
    
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
    
    // Ressource externe (lien URL vers documentation, article, etc.)
    resource: { type: String }, // URL de la ressource
    
    // Snippet de code associé à la connaissance
    snippet: {
      code: { type: String }, // Le code
      language: { type: String }, // Langage de programmation (javascript, python, etc.)
    },
    
    // Tags pour catégoriser la connaissance
    tags: [{ type: String }],
    
    // Commentaires sur la connaissance
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    
    // Utilisateurs qui ont réagi (like) à la connaissance
    reactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    
    // Compteur de réactions
    reactionCount: { type: Number, default: 0, min: 0 },
    
    // Utilisateurs qui ont partagé la connaissance
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    
    // Compteur de partages
    shareCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Knowledge", knowledgeSchema);
