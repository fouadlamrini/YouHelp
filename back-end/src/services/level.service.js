const Level = require("../models/Level");

async function getAll() {
  const levels = await Level.find().sort({ createdAt: -1 });
  if (!levels || levels.length === 0) {
    return { error: { status: 404, message: "No levels found" } };
  }
  return { data: levels };
}

async function getById(id) {
  const level = await Level.findById(id);
  if (!level) return { error: { status: 404, message: "Level not found" } };
  return { data: level };
}

async function create(body) {
  const name = (body.name || "").trim();
  const existing = await Level.findOne({ name });
  if (existing) return { error: { status: 400, message: "Level already exists" } };
  const level = await Level.create({ name });
  return { data: level };
}

async function update(id, body) {
  const name = (body.name || "").trim();
  const level = await Level.findByIdAndUpdate(id, { name }, { new: true, runValidators: true });
  if (!level) return { error: { status: 404, message: "Level not found" } };
  return { data: level };
}

async function deleteLevel(id) {
  const level = await Level.findByIdAndDelete(id);
  if (!level) return { error: { status: 404, message: "Level not found" } };
  return { ok: true };
}

module.exports = { getAll, getById, create, update, deleteLevel };
