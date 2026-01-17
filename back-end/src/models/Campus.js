const mongoose = require("mongoose");
const campusSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

module.exports = mongoose.model("Campus", campusSchema);
