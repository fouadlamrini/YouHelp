const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  level: { type: String, required: true},
  name: { type: String, required: true, unique: true },
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
