const mongoose = require("mongoose");
const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nickName: { type: String },
  year: Number,
  campus: { type: mongoose.Schema.Types.ObjectId, ref: "Campus", default: null },
});

module.exports = mongoose.model("Class", classSchema);
