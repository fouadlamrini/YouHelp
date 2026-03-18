const mongoose = require("mongoose");
const User = require("../models/User");
const Campus = require("../models/Campus");
const Class = require("../models/Class");
const Post = require("../models/Post");
const Knowledge = require("../models/Knowledge");
const Role = require("../models/Role");
const { refId } = require("../utils/contextUtils");

async function getCurrentUserWithContext(userId) {
  return User.findById(userId)
    .populate("role", "name")
    .populate("campus", "name")
    .populate("class", "name year")
    .populate("level", "name");
}

async function getStats(userId) {
  const current = await getCurrentUserWithContext(userId);
  if (!current) return { error: { status: 401, message: "Unauthorized" } };
  const roleName = current.role?.name || null;
  const campusId = refId(current.campus);
  const campusObjId = campusId && mongoose.Types.ObjectId.isValid(campusId) ? new mongoose.Types.ObjectId(campusId) : null;
  const adminRole = await Role.findOne({ name: "admin" });
  const formateurRole = await Role.findOne({ name: "formateur" });
  const etudiantRole = await Role.findOne({ name: "etudiant" });
  const roles = { adminRole, formateurRole, etudiantRole };

  if (roleName === "super_admin") {
    const data = await getSuperAdminStats(roles);
    return { data };
  }
  if (roleName === "admin" && campusId) {
    if (campusObjId) {
      const data = await getAdminStats(campusObjId, roles);
      return { data };
    }
  }
  if (roleName === "formateur" && campusId) {
    if (campusObjId) {
      const data = await getFormateurStats(campusObjId, roles);
      return { data };
    }
  }
  return { data: { role: roleName, message: "No stats for this role or missing campus." } };
}

async function getSuperAdminStats({ adminRole, formateurRole, etudiantRole }) {
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
  return {
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
  };
}

async function getAdminStats(campusId, { adminRole, formateurRole, etudiantRole }) {
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
  return {
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
  };
}

async function getFormateurStats(campusId, { formateurRole, etudiantRole }) {
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
  return {
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
  };
}

module.exports = { getStats };
