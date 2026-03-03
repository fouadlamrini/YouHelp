const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: { type: String, required: true, unique: true },
    icon: { type: String, default: null },
    color: { type: String, default: null },
  },
  { timestamps: true }
);

// Empêcher les doublons de nom dans une même catégorie
subCategorySchema.index({ name: 1, category: 1 }, { unique: true });
module.exports = mongoose.model("SubCategory", subCategorySchema);
