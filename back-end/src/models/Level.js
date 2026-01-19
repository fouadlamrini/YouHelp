const mongoose = require("mongoose");
const levelSchema = new mongoose.Schema({
  name: { type: String, enum: ["Sas","1A", "2A","Graduate"] },
});

module.exports = mongoose.model("Level", levelSchema);
