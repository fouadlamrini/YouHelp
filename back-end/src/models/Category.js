const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    // icon name from your icon set (e.g. "FiCode")
    icon: { type: String, default: null },
    // main color used on the frontend (Tailwind class or hex)
    color: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
