const Knowledge = require("../models/Knowledge");
const User = require("../models/User");

function refId(ref) {
  if (!ref) return null;
  return (ref._id || ref).toString();
}

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

    const authorId = knowledge.author?._id?.toString() || knowledge.author?.toString();
    if (authorId === req.user.id.toString()) return next();

    const author = knowledge.author?.toObject ? knowledge.author : await User.findById(knowledge.author).populate("role", "name").populate("campus class level").lean();
    const authorRoleName = author?.role?.name ?? author?.role ?? null;

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
