const mongoose = require("mongoose");
const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nickName: { type: String },
  year: Number,
});

module.exports = mongoose.model("Class", classSchema);
