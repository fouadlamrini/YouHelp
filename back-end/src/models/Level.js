const levelSchema = new mongoose.Schema({
  name: { type: String, enum: ["1A", "2A", "3A"] },
});

module.exports = mongoose.model("Level", levelSchema);
