const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['admin', 'formateur', 'etudiant', 'noRole'], 
    required: true,
    unique: true
  },
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
