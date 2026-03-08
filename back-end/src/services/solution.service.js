const Solution = require("../models/Solution");
const Post = require("../models/Post");
const User = require("../models/User");

async function markPostAsSolved(userId, postId, body) {
  const post = await Post.findById(postId);
  if (!post) return { error: { status: 404, message: "Post introuvable" } };
  const user = await User.findById(userId).populate("role", "name");
  const isOwner = post.author.toString() === userId;
  const roleName = user.role?.name ?? (user.role && user.role.toString?.()) ?? null;
  const isFormateur = roleName === "formateur";
  const isAdmin = roleName === "admin";
  if (!isOwner && !isFormateur && !isAdmin) {
    return { error: { status: 403, message: "Seul le formateur ou l'owner du post peut marquer comme résolu" } };
  }
  if (post.isSolved) return { error: { status: 400, message: "Ce post est déjà marqué comme résolu" } };
  const description = (body.description && body.description.trim()) || "Marqué comme résolu";
  const solution = await Solution.create({ post: postId, description, markedBy: userId });
  await Post.findByIdAndUpdate(postId, { isSolved: true });
  return { data: solution };
}

async function unmarkPostAsSolved(userId, postId) {
  const post = await Post.findById(postId);
  if (!post) return { error: { status: 404, message: "Post introuvable" } };
  const user = await User.findById(userId).populate("role", "name");
  const isOwner = post.author.toString() === userId;
  const roleName = user.role?.name ?? null;
  const isFormateur = roleName === "formateur";
  const isAdmin = roleName === "admin";
  if (!isOwner && !isFormateur && !isAdmin) {
    return { error: { status: 403, message: "Seul le formateur ou l'owner du post peut retirer la solution" } };
  }
  if (!post.isSolved) return { error: { status: 400, message: "Ce post n'est pas marqué comme résolu" } };
  await Solution.deleteOne({ post: postId });
  await Post.findByIdAndUpdate(postId, { isSolved: false });
  return { ok: true };
}

async function getSolutionByPostId(postId) {
  const post = await Post.findById(postId);
  if (!post) return { error: { status: 404, message: "Post introuvable" } };
  const solution = await Solution.findOne({ post: postId })
    .populate("markedBy", "name email role")
    .populate("post", "title content isSolved");
  if (!solution) return { error: { status: 404, message: "Aucune solution trouvée pour ce post" } };
  return { data: solution };
}

async function getAllSolvedPosts() {
  const solutions = await Solution.find()
    .populate("post", "title content author category subCategory isSolved")
    .populate("markedBy", "name email role")
    .sort({ createdAt: -1 });
  return { data: solutions };
}

async function updateSolutionDescription(userId, postId, body) {
  const description = body.description?.trim();
  if (!description) return { error: { status: 400, message: "La nouvelle description de la solution est obligatoire" } };
  const post = await Post.findById(postId);
  if (!post) return { error: { status: 404, message: "Post introuvable" } };
  const solution = await Solution.findOne({ post: postId });
  if (!solution) return { error: { status: 404, message: "Aucune solution trouvée pour ce post" } };
  const user = await User.findById(userId).populate("role", "name");
  const isOwner = post.author.toString() === userId;
  const isFormateur = user.role?.name === "formateur";
  const isAdmin = user.role?.name === "admin";
  if (!isOwner && !isFormateur && !isAdmin) {
    return { error: { status: 403, message: "Seul le formateur ou l'owner du post peut mettre à jour la solution" } };
  }
  solution.description = description;
  await solution.save();
  return { data: solution };
}

module.exports = {
  markPostAsSolved,
  unmarkPostAsSolved,
  getSolutionByPostId,
  getAllSolvedPosts,
  updateSolutionDescription,
};
