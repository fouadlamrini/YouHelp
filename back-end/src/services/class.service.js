const Class = require("../models/Class");
const Campus = require("../models/Campus");

async function getAll() {
  const classes = await Class.find().populate("campus", "name").sort({ createdAt: -1 });
  return { data: classes };
}

async function getById(id) {
  const classDoc = await Class.findById(id).populate("campus", "name");
  if (!classDoc) return { error: { status: 404, message: "Class not found" } };
  return { data: classDoc };
}

async function create(body) {
  const { name, nickName, year, campus } = body;
  let campusId = null;
  if (campus) {
    const campusDoc = await Campus.findById(campus);
    if (!campusDoc) return { error: { status: 400, message: "Campus not found" } };
    campusId = campusDoc._id;
  }
  const classDoc = await Class.create({
    name: (name || "").trim(),
    nickName: nickName?.trim() || undefined,
    year: year ? Number(year) : undefined,
    campus: campusId,
  });
  await classDoc.populate("campus", "name");
  return { data: classDoc };
}

async function update(id, body) {
  const { name, nickName, year, campus } = body;
  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (nickName !== undefined) updateData.nickName = nickName?.trim() || null;
  if (year !== undefined) {
    updateData.year = year === null || year === "" ? null : Number(year);
  }
  if (campus !== undefined) {
    if (!campus) {
      updateData.campus = null;
    } else {
      const campusDoc = await Campus.findById(campus);
      if (!campusDoc) return { error: { status: 400, message: "Campus not found" } };
      updateData.campus = campusDoc._id;
    }
  }
  const classDoc = await Class.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("campus", "name");
  if (!classDoc) return { error: { status: 404, message: "Class not found" } };
  return { data: classDoc };
}

async function deleteClass(id) {
  const classDoc = await Class.findByIdAndDelete(id);
  if (!classDoc) return { error: { status: 404, message: "Class not found" } };
  return { ok: true };
}

module.exports = { getAll, getById, create, update, deleteClass };
