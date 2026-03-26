const Favorite = require("../models/Favorite");
const Post = require("../models/Post");

async function addToFavorites(userId, body) {
  const { contentType, contentId } = body;
  const content = await Post.findById(contentId).select("type").lean();
  if (!content) return { error: { status: 404, message: contentType === "knowledge" ? "Connaissance non trouvée" : "Post non trouvé" } };
  const existing = await Favorite.findOne({ user: userId, post: contentId });
  if (existing) return { error: { status: 400, message: "Ce contenu est déjà dans vos favoris" } };
  const favoriteData = { user: userId, contentType };
  favoriteData.post = contentId;
  try {
    const favorite = await Favorite.create(favoriteData);
    return { data: favorite };
  } catch (err) {
    if (err.code === 11000) return { error: { status: 400, message: "Ce contenu est déjà dans vos favoris" } };
    throw err;
  }
}

async function removeFromFavorites(userId, body) {
  const { contentType, contentId } = body;
  const favorite = await Favorite.findOneAndDelete({ user: userId, post: contentId, contentType });
  if (!favorite) return { error: { status: 404, message: "Ce contenu n'est pas dans vos favoris" } };
  return { ok: true };
}

async function getUserFavorites(userId) {
  const favorites = await Favorite.find({ user: userId })
    .populate({
      path: "post",
      populate: [
        { path: "author", select: "name email profilePicture" },
        { path: "category", select: "name" },
        { path: "subCategory", select: "name" },
      ],
    })
    .sort({ createdAt: -1 });
  return {
    data: {
      favorites,
    },
  };
}

async function checkIfFavorite(userId, contentType, contentId) {
  if (!["post", "knowledge"].includes(contentType)) {
    return { error: { status: 400, message: "Type de contenu invalide. Utilisez 'post' ou 'knowledge'" } };
  }
  const favorite = await Favorite.findOne({ user: userId, post: contentId, contentType });
  return { data: { isFavorite: favorite ? true : false } };
}

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  checkIfFavorite,
};
