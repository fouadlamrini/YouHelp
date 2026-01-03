const mongoose = require("mongoose");

// Schema pour enregistrer la solution d'un post
// - post: le post qui a été marqué comme résolu
// - description: la description de la solution trouvée
// - markedBy: l'utilisateur (formateur ou owner du post) qui a marqué comme résolu
// - createdAt: date de création de la solution
const solutionSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    description: { type: String, required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Index unique: un post ne peut avoir qu'une seule solution
solutionSchema.index({ post: 1 }, { unique: true });

module.exports = mongoose.model("Solution", solutionSchema);
