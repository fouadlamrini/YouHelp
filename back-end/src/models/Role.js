const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['super_admin','admin', 'formateur', 'etudiant', 'visiteur'], 
    required: true,
    unique: true
  },
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
