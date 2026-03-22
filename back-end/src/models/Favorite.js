const mongoose = require("mongoose");

// Schema pour gérer les favoris des utilisateurs
// - Un utilisateur peut ajouter des posts ou des connaissances à ses favoris
// - Chaque favori contient: utilisateur, type de contenu (post/knowledge), référence vers le contenu
const favoriteSchema = new mongoose.Schema(
  {
    // Utilisateur qui ajoute le favori
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    
    // Type de contenu favori: 'post' ou 'knowledge'
    contentType: { 
      type: String, 
      required: true, 
      enum: ["post", "knowledge"] 
    },
    
    // Référence vers le contenu (toujours un Post; distinguer par contentType)
    post: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Post" 
    },
  },
  { timestamps: true }
);

// Index composé pour éviter les doublons (un utilisateur ne peut pas ajouter le même contenu deux fois)
favoriteSchema.index({ user: 1, post: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Favorite", favoriteSchema);