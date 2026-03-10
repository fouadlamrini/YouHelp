const User = require("../models/User");
const Role = require("../models/Role");
const Post = require("../models/Post");

async function getPublicStats() {
  const [etudiantRole, formateurRole] = await Promise.all([
    Role.findOne({ name: "etudiant" }),
    Role.findOne({ name: "formateur" }),
  ]);

  const activeStudentQuery = { status: "active" };
  if (etudiantRole) {
    activeStudentQuery.role = etudiantRole._id;
  }

  const [activeStudents, solvedPosts, totalFormateurs] = await Promise.all([
    User.countDocuments(activeStudentQuery),
    Post.countDocuments({ isSolved: true }),
    formateurRole ? User.countDocuments({ role: formateurRole._id }) : 0,
  ]);

  return { data: { activeStudents, solvedPosts, totalFormateurs } };
}

module.exports = { getPublicStats };

