const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  year: Number,
});

module.exports = mongoose.model("Class", classSchema);
