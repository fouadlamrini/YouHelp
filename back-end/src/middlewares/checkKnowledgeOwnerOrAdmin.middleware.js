const Knowledge = require("../models/Knowledge");
const User = require("../models/User");
const { refId } = require("../utils/contextUtils");

function sameRef(a, b) {
  const idA = refId(a);
  const idB = refId(b);
  return idA && idB && idA === idB;
}

module.exports = async (req, res, next) => {
  try {
    const knowledge = await Knowledge.findById(req.params.id)
      .populate({ path: "author", populate: { path: "role", select: "name" }, select: "campus class level role" });
    if (!knowledge) return res.status(404).json({ message: "Connaissance introuvable" });

    if (req.user.role === "super_admin") return next();

    const authorId = knowledge.author?._id?.toString();
    if (authorId === req.user.id.toString()) return next();

    const author = knowledge.author;
    const authorRoleName = author?.role?.name || null;

    if (req.user.role === "admin") {
      if (authorRoleName !== "etudiant" && authorRoleName !== "formateur") return res.status(403).json({ message: "Access denied" });
      const me = await User.findById(req.user.id).select("campus").lean();
      if (sameRef(me?.campus, author?.campus)) return next();
      return res.status(403).json({ message: "Access denied" });
    }

    if (req.user.role === "formateur") {
      if (authorRoleName !== "etudiant") return res.status(403).json({ message: "Access denied" });
      const me = await User.findById(req.user.id).select("campus class level").lean();
      if (sameRef(me?.campus, author?.campus) && sameRef(me?.class, author?.class) && sameRef(me?.level, author?.level)) return next();
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(403).json({ message: "Access denied" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
