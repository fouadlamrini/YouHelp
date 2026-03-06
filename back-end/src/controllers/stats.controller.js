const mongoose = require("mongoose");
const User = require("../models/User");
const Campus = require("../models/Campus");
const Class = require("../models/Class");
const Post = require("../models/Post");
const Knowledge = require("../models/Knowledge");
const Role = require("../models/Role");

async function getCurrentUserWithContext(userId) {
  return User.findById(userId)
    .populate("role", "name")
    .populate("campus", "name")
    .populate("class", "name year")
    .populate("level", "name");
}

/** refId for comparison */
function refId(ref) {
  if (!ref) return null;
  return (ref._id || ref).toString();
}

class StatsController {
  async getStats(req, res) {
    try {
      const userId = req.user?.id ?? req.user?._id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const current = await getCurrentUserWithContext(userId);
      if (!current) return res.status(401).json({ message: "Unauthorized" });

      const roleName = current.role?.name || null;
      const campusId = refId(current.campus);

      const adminRole = await Role.findOne({ name: "admin" });
      const formateurRole = await Role.findOne({ name: "formateur" });
      const etudiantRole = await Role.findOne({ name: "etudiant" });

      if (roleName === "super_admin") {
        return await this._getSuperAdminStats(res, { adminRole, formateurRole, etudiantRole });
      }
      if (roleName === "admin" && campusId) {
        let campusObjId = null;
        try {
          if (mongoose.Types.ObjectId.isValid(campusId) && String(campusId).length === 24) {
            campusObjId = new mongoose.Types.ObjectId(campusId);
          }
        } catch (_) {}
        if (campusObjId) return await this._getAdminStats(res, campusObjId, { adminRole, formateurRole, etudiantRole });
      }
      if (roleName === "formateur" && campusId) {
        let campusObjId = null;
        try {
          if (mongoose.Types.ObjectId.isValid(campusId) && String(campusId).length === 24) {
            campusObjId = new mongoose.Types.ObjectId(campusId);
          }
        } catch (_) {}
        if (campusObjId) return await this._getFormateurStats(res, campusObjId, { adminRole, formateurRole, etudiantRole });
      }

      return res.json({ success: true, data: { role: roleName, message: "No stats for this role or missing campus." } });
    } catch (err) {
      console.error("Stats error:", err);
      return res.status(500).json({
        message: "Server error",
        error: err.message,
      });
    }
  }

  async _getSuperAdminStats(res, { adminRole, formateurRole, etudiantRole }) {
    const [totalCampuses, totalClasses, campusesList, adminCount, formateurCount, etudiantCount, totalPosts, totalKnowledge] = await Promise.all([
      Campus.countDocuments(),
      Class.countDocuments(),
      Campus.find().select("name").lean(),
      adminRole ? User.countDocuments({ role: adminRole._id }) : 0,
      formateurRole ? User.countDocuments({ role: formateurRole._id }) : 0,
      etudiantRole ? User.countDocuments({ role: etudiantRole._id }) : 0,
      Post.countDocuments(),
      Knowledge.countDocuments(),
    ]);

    const campusIds = campusesList.map((c) => c._id);
    const hasCampuses = campusIds.length > 0;
    const [classesByCampus, adminsByCampus, formateursByCampus, etudiantsByCampus] = await Promise.all([
      hasCampuses ? Class.aggregate([{ $match: { campus: { $in: campusIds } } }, { $group: { _id: "$campus", count: { $sum: 1 } } }]) : [],
      hasCampuses && adminRole ? User.aggregate([{ $match: { role: adminRole._id, campus: { $in: campusIds } } }, { $group: { _id: "$campus", count: { $sum: 1 } } }]) : [],
      hasCampuses && formateurRole ? User.aggregate([{ $match: { role: formateurRole._id, campus: { $in: campusIds } } }, { $group: { _id: "$campus", count: { $sum: 1 } } }]) : [],
      hasCampuses && etudiantRole ? User.aggregate([{ $match: { role: etudiantRole._id, campus: { $in: campusIds } } }, { $group: { _id: "$campus", count: { $sum: 1 } } }]) : [],
    ]);

    const campusMap = Object.fromEntries(campusesList.map((c) => [c._id.toString(), c.name]));
    const byCampus = (arr) =>
      campusesList.map((c) => ({
        campusName: c.name,
        campusId: c._id.toString(),
        count: (arr.find((x) => x._id && x._id.toString() === c._id.toString()) || {}).count || 0,
      }));

    const etudiantsByLevel = etudiantRole
      ? await User.aggregate([
          { $match: { role: etudiantRole._id } },
          { $group: { _id: "$level", count: { $sum: 1 } } },
          { $lookup: { from: "levels", localField: "_id", foreignField: "_id", as: "levelDoc" } },
          { $unwind: { path: "$levelDoc", preserveNullAndEmptyArrays: true } },
          { $project: { levelName: "$levelDoc.name", count: 1, _id: 1 } },
        ])
      : [];
    const etudiantsByYear = etudiantRole
      ? await User.aggregate([
          { $match: { role: etudiantRole._id } },
          { $lookup: { from: "classes", localField: "class", foreignField: "_id", as: "classDoc" } },
          { $unwind: { path: "$classDoc", preserveNullAndEmptyArrays: true } },
          { $group: { _id: "$classDoc.year", count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ])
      : [];

    return res.json({
      success: true,
      data: {
        role: "super_admin",
        totalCampuses,
        totalClasses,
        classesByCampus: byCampus(classesByCampus),
        totalAdmins: adminCount,
        adminsByCampus: byCampus(adminsByCampus),
        totalFormateurs: formateurCount,
        formateursByCampus: byCampus(formateursByCampus),
        totalEtudiants: etudiantCount,
        etudiantsByCampus: byCampus(etudiantsByCampus),
        etudiantsByLevel,
        etudiantsByYear,
        totalPosts,
        totalKnowledge,
      },
    });
  }

  async _getAdminStats(res, campusId, { adminRole, formateurRole, etudiantRole }) {
    const [
      campusDoc,
      adminsInCampus,
      classesInCampus,
      formateursInCampus,
      etudiantsInCampus,
      etudiantsByLevel,
      etudiantsByYear,
    ] = await Promise.all([
      Campus.findById(campusId).select("name").lean(),
      adminRole ? User.countDocuments({ role: adminRole._id, campus: campusId }) : 0,
      Class.countDocuments({ campus: campusId }),
      formateurRole ? User.countDocuments({ role: formateurRole._id, campus: campusId }) : 0,
      etudiantRole ? User.countDocuments({ role: etudiantRole._id, campus: campusId }) : 0,
      etudiantRole
        ? User.aggregate([
            { $match: { role: etudiantRole._id, campus: campusId } },
            { $group: { _id: "$level", count: { $sum: 1 } } },
            { $lookup: { from: "levels", localField: "_id", foreignField: "_id", as: "levelDoc" } },
            { $unwind: { path: "$levelDoc", preserveNullAndEmptyArrays: true } },
            { $project: { levelName: "$levelDoc.name", count: 1 } },
          ])
        : [],
      etudiantRole
        ? User.aggregate([
            { $match: { role: etudiantRole._id, campus: campusId } },
            { $lookup: { from: "classes", localField: "class", foreignField: "_id", as: "classDoc" } },
            { $unwind: { path: "$classDoc", preserveNullAndEmptyArrays: true } },
            { $group: { _id: "$classDoc.year", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ])
        : [],
    ]);

    const authorIds = await User.find({ campus: campusId }).distinct("_id");
    const [postsInCampus, knowledgeInCampus] = await Promise.all([
      Post.countDocuments({ author: { $in: authorIds } }),
      Knowledge.countDocuments({ author: { $in: authorIds } }),
    ]);

    return res.json({
      success: true,
      data: {
        role: "admin",
        campusName: campusDoc?.name || null,
        campusId: campusId.toString(),
        adminsInCampus,
        classesInCampus,
        formateursInCampus,
        etudiantsInCampus,
        etudiantsByLevel,
        etudiantsByYear,
        postsInCampus,
        knowledgeInCampus,
      },
    });
  }

  async _getFormateurStats(res, campusId, { formateurRole, etudiantRole }) {
    const [
      campusDoc,
      classesInCampus,
      formateursInCampus,
      etudiantsInCampus,
      etudiantsByLevel,
      etudiantsByYear,
    ] = await Promise.all([
      Campus.findById(campusId).select("name").lean(),
      Class.countDocuments({ campus: campusId }),
      formateurRole ? User.countDocuments({ role: formateurRole._id, campus: campusId }) : 0,
      etudiantRole ? User.countDocuments({ role: etudiantRole._id, campus: campusId }) : 0,
      etudiantRole
        ? User.aggregate([
            { $match: { role: etudiantRole._id, campus: campusId } },
            { $group: { _id: "$level", count: { $sum: 1 } } },
            { $lookup: { from: "levels", localField: "_id", foreignField: "_id", as: "levelDoc" } },
            { $unwind: { path: "$levelDoc", preserveNullAndEmptyArrays: true } },
            { $project: { levelName: "$levelDoc.name", count: 1 } },
          ])
        : [],
      etudiantRole
        ? User.aggregate([
            { $match: { role: etudiantRole._id, campus: campusId } },
            { $lookup: { from: "classes", localField: "class", foreignField: "_id", as: "classDoc" } },
            { $unwind: { path: "$classDoc", preserveNullAndEmptyArrays: true } },
            { $group: { _id: "$classDoc.year", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ])
        : [],
    ]);

    const authorIdsFormateur = await User.find({ campus: campusId }).distinct("_id");
    const [postsInCampus, knowledgeInCampus] = await Promise.all([
      Post.countDocuments({ author: { $in: authorIdsFormateur } }),
      Knowledge.countDocuments({ author: { $in: authorIdsFormateur } }),
    ]);

    return res.json({
      success: true,
      data: {
        role: "formateur",
        campusName: campusDoc?.name || null,
        campusId: campusId.toString(),
        classesInCampus,
        formateursInCampus,
        etudiantsInCampus,
        etudiantsByLevel,
        etudiantsByYear,
        postsInCampus,
        knowledgeInCampus,
      },
    });
  }
}

module.exports = new StatsController();
