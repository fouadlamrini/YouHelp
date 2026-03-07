const Class = require("../models/Class");
const Campus = require("../models/Campus");

class ClassController {
  async getAll(req, res) {
    try {
      const classes = await Class.find()
        .populate("campus", "name")
        .sort({ createdAt: -1 });
      res.json({ success: true, data: classes });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getById(req, res) {
    try {
      const classDoc = await Class.findById(req.params.id).populate("campus", "name");
      if (!classDoc) return res.status(404).json({ message: "Class not found" });
      res.json({ success: true, data: classDoc });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async create(req, res) {
    try {
      const { name, nickName, year, campus } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ message: "Name is required" });
      }
      if (year !== undefined && year !== null && year !== "") {
        const yearNum = Number(year);
        if (!Number.isInteger(yearNum) || yearNum < 2018) {
          return res.status(400).json({ message: "L'année doit être un nombre supérieur ou égal à 2018." });
        }
      }
      let campusId = null;
      if (campus) {
        const campusDoc = await Campus.findById(campus);
        if (!campusDoc) return res.status(400).json({ message: "Campus not found" });
        campusId = campusDoc._id;
      }
      const classDoc = await Class.create({
        name: name.trim(),
        nickName: nickName?.trim() || undefined,
        year: year ? Number(year) : undefined,
        campus: campusId,
      });
      await classDoc.populate("campus", "name");
      res.status(201).json({ success: true, data: classDoc });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, nickName, year, campus } = req.body;
      const updateData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (nickName !== undefined) updateData.nickName = nickName?.trim() || null;
      if (year !== undefined) {
        if (year === null || year === "") {
          updateData.year = null;
        } else {
          const yearNum = Number(year);
          if (!Number.isInteger(yearNum) || yearNum < 2018) {
            return res.status(400).json({ message: "L'année doit être un nombre supérieur ou égal à 2018." });
          }
          updateData.year = yearNum;
        }
      }
      if (campus !== undefined) {
        if (!campus) {
          updateData.campus = null;
        } else {
          const campusDoc = await Campus.findById(campus);
          if (!campusDoc) return res.status(400).json({ message: "Campus not found" });
          updateData.campus = campusDoc._id;
        }
      }
      const classDoc = await Class.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate("campus", "name");
      if (!classDoc) return res.status(404).json({ message: "Class not found" });
      res.json({ success: true, data: classDoc });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async delete(req, res) {
    try {
      const classDoc = await Class.findByIdAndDelete(req.params.id);
      if (!classDoc) return res.status(404).json({ message: "Class not found" });
      res.json({ success: true, message: "Class deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new ClassController();
