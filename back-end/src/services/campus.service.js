const Campus = require("../models/Campus");

async function getAll() {
  const campuses = await Campus.find().sort({ createdAt: -1 });
  if (!campuses || campuses.length === 0) {
    return { error: { status: 404, message: "No campuses found" } };
  }
  return { data: campuses };
}

async function getById(id) {
  const campus = await Campus.findById(id);
  if (!campus) return { error: { status: 404, message: "Campus not found" } };
  return { data: campus };
}

async function create(body) {
  const name = (body.name || "").trim();
  const existing = await Campus.findOne({ name });
  if (existing) return { error: { status: 400, message: "Campus already exists" } };
  const campus = await Campus.create({ name });
  return { data: campus };
}

async function update(id, body) {
  const name = (body.name || "").trim();
  const campus = await Campus.findByIdAndUpdate(id, { name }, { new: true, runValidators: true });
  if (!campus) return { error: { status: 404, message: "Campus not found" } };
  return { data: campus };
}

async function deleteCampus(id) {
  const campus = await Campus.findByIdAndDelete(id);
  if (!campus) return { error: { status: 404, message: "Campus not found" } };
  return { ok: true };
}

module.exports = { getAll, getById, create, update, deleteCampus };
