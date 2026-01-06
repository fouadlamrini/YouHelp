const mongoose = require("mongoose");

// Schema de partage d'un post
// - post: le post original qui a été partagé
// - sharedBy: l'utilisateur qui a fait le partage
// - createdAt: date du partage (gérée automatiquement)
const partageSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Contrainte d'unicité: un utilisateur ne peut partager le même post qu'une seule fois
partageSchema.index({ post: 1, sharedBy: 1 }, { unique: true });

module.exports = mongoose.model("Partage", partageSchema);
