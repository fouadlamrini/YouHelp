const Knowledge = require("../models/Knowledge");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const User = require("../models/User");
const Engagement = require("../models/Engagement");
const Notification = require("../models/Notification");
const { areFriends, getMyFriendIds } = require("./friend.service");
const { haveSameClassContext } = require("../utils/contextUtils");

async function canModerateKnowledge(currentUserId, currentUser, knowledge) {
  if (!currentUserId || !currentUser) return false;
  const roleName = currentUser.role?.name || null;
  if (roleName === "super_admin") return true;
  const authorId = knowledge.author?._id?.toString() || knowledge.author?.toString();
  if (authorId === currentUserId.toString()) return true;
  if (roleName !== "admin" && roleName !== "formateur") return false;
  const author = knowledge.author?.toObject
    ? knowledge.author
    : await User.findById(knowledge.author).populate("role", "name").populate("campus class level").lean();
  if (!author) return false;
  const authorRoleName = author.role?.name || null;
  const currentCampusId = currentUser.campus?._id || currentUser.campus;
  const authorCampusId = author.campus?._id || author.campus;
  const sameCampus =
    currentCampusId &&
    authorCampusId &&
    currentCampusId.toString() === authorCampusId.toString();
  if (roleName === "admin") {
    if (authorRoleName !== "etudiant" && authorRoleName !== "formateur") return false;
    return sameCampus;
  }
  if (roleName === "formateur") {
    if (authorRoleName !== "etudiant") return false;
    return haveSameClassContext(currentUser, author);
  }
  return false;
}

async function knowledgeCanReact(currentUserId, currentUser, knowledge, viewFilter) {
  if (!currentUser || currentUser.status !== "active") return false;
  const author = knowledge.author;
  if (!author) return false;
  const authorId = author._id || author;
  if (currentUserId.toString() === authorId.toString()) return true;
  if (currentUser.role?.name === "super_admin") return true;
  if (author?.role?.name === "super_admin") return true;
  if (viewFilter === "friends") return true;
  const sameContext = haveSameClassContext(currentUser, author);
  if (viewFilter === "my_campus") return sameContext;
  const friend = await areFriends(currentUserId, authorId);
  return sameContext || friend;
}

async function createKnowledge(userId, body, mediaFiles) {
  const currentUser = await User.findById(userId).select("status").lean();
  if (!currentUser || currentUser.status !== "active") {
    return { error: { status: 403, message: "Seuls les comptes activés peuvent créer des connaissances." } };
  }
  const { content, category, subCategory } = body;
  const categoryDoc = await Category.findOne({ name: category });
  if (!categoryDoc) return { error: { status: 400, message: "Catégorie introuvable" } };
  let subCategoryId = null;
  if (subCategory) {
    const subCategoryDoc = await SubCategory.findOne({ name: subCategory, category: categoryDoc._id });
    if (!subCategoryDoc) return { error: { status: 400, message: "Sous-catégorie introuvable" } };
    subCategoryId = subCategoryDoc._id;
  }
  const knowledge = await Knowledge.create({
    content,
    author: userId,
    category: categoryDoc._id,
    subCategory: subCategoryId,
    media: mediaFiles || [],
  });
  return { data: knowledge };
}

async function getAllKnowledge(userId, queryFilter) {
  const rawFilter = (queryFilter || "all").toString().toLowerCase();
  const allowedFilters = ["all", "friends", "my_campus"];
  const viewFilter = allowedFilters.includes(rawFilter) ? rawFilter : "all";

  const currentUser = await User.findById(userId)
    .select("status campus class level role")
    .populate("campus class level")
    .populate("role", "name");
  if (!currentUser) return { error: { status: 403, message: "Utilisateur introuvable" } };

  let authorFilter = {};
  let noAuthors = false;
  if (currentUser.status === "active") {
    const friendIds = await getMyFriendIds(userId);
    if (viewFilter === "friends") {
      if (friendIds.length === 0) noAuthors = true;
      else authorFilter = { author: { $in: friendIds } };
    } else if (viewFilter === "my_campus") {
      const campusId = currentUser.campus?._id || currentUser.campus;
      if (campusId) {
        const sameCampusIds = await User.find({ campus: campusId }).distinct("_id");
        if (sameCampusIds.length === 0) noAuthors = true;
        else authorFilter = { author: { $in: sameCampusIds } };
      }
    }
  }

  if (noAuthors) return { data: [] };

  const knowledgeDocs = await Knowledge.find(authorFilter)
    .sort({ createdAt: -1 })
    .populate({ path: "author", select: "name email role profilePicture campus class level", populate: { path: "role", select: "name" } })
    .populate("category", "name")
    .populate("subCategory", "name")
    .populate("comments");

  const withMeta = await Promise.all(
    knowledgeDocs.map(async (k) => {
      const canReact = await knowledgeCanReact(userId, currentUser, k, viewFilter);
      const canModerate = await canModerateKnowledge(userId, currentUser, k);
      return { ...k.toObject(), canReact, canModerate };
    })
  );
  return { data: withMeta };
}

async function getKnowledgeById(userId, knowledgeId) {
  const knowledge = await Knowledge.findById(knowledgeId)
    .populate({ path: "author", select: "name email role profilePicture campus class level", populate: { path: "role", select: "name" } })
    .populate("category", "name")
    .populate("subCategory", "name")
    .populate("comments");
  if (!knowledge) return { error: { status: 404, message: "Connaissance introuvable" } };

  const currentUser = await User.findById(userId)
    .select("status campus class level role")
    .populate("campus class level")
    .populate("role", "name");
  if (!currentUser) return { error: { status: 403, message: "Utilisateur introuvable" } };

  const canReact = await knowledgeCanReact(userId, currentUser, knowledge, "all");
  const canModerate = await canModerateKnowledge(userId, currentUser, knowledge);
  return { data: { ...knowledge.toObject(), canReact, canModerate } };
}

function parseExistingMedia(existingMediaRaw) {
  if (!existingMediaRaw) return [];
  if (Array.isArray(existingMediaRaw)) return existingMediaRaw;
  if (typeof existingMediaRaw === "string") return JSON.parse(existingMediaRaw || "[]");
  return [];
}

async function updateKnowledge(userId, knowledgeId, body, uploadedMedia) {
  const knowledge = await Knowledge.findById(knowledgeId);
  if (!knowledge) return { error: { status: 404, message: "Connaissance introuvable" } };

  const user = await User.findById(userId).populate("role", "name");
  const isOwner = knowledge.author.toString() === userId;
  const roleName = user?.role?.name || null;
  const isAdmin = roleName === "admin";
  if (!isOwner && !isAdmin) {
    return { error: { status: 403, message: "Seul l'auteur ou un admin peut mettre à jour cette connaissance" } };
  }

  const { category, subCategory, ...rest } = body;
  let updateData = { ...rest };
  if (category) {
    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) return { error: { status: 400, message: "Catégorie introuvable" } };
    updateData.category = categoryDoc._id;
    if (subCategory) {
      const subCategoryDoc = await SubCategory.findOne({ name: subCategory, category: categoryDoc._id });
      if (!subCategoryDoc) return { error: { status: 400, message: "Sous-catégorie introuvable" } };
      updateData.subCategory = subCategoryDoc._id;
    }
  }
  try {
    const existingMedia = parseExistingMedia(body.existingMedia);
    if (existingMedia.length || (uploadedMedia && uploadedMedia.length)) {
      updateData.media = [...existingMedia, ...(uploadedMedia || [])];
    }
  } catch (e) {
    console.error("Error parsing existingMedia for knowledge update:", e);
  }

  const updatedKnowledge = await Knowledge.findByIdAndUpdate(knowledgeId, updateData, { new: true, runValidators: true });
  return { data: updatedKnowledge };
}

async function deleteKnowledge(userId, knowledgeId) {
  const knowledge = await Knowledge.findById(knowledgeId);
  if (!knowledge) return { error: { status: 404, message: "Connaissance introuvable" } };

  const authorId = (knowledge.author && knowledge.author.toString ? knowledge.author.toString() : knowledge.author?.toString?.()) || null;
  const deleterId = userId.toString();
  if (authorId && authorId !== deleterId) {
    const actor = await User.findById(userId).select("name").populate("role", "name").lean();
    const roleName = actor?.role?.name || null;
    const message =
      roleName === "super_admin"
        ? "Le super admin a supprimé votre connaissance."
        : roleName === "admin"
          ? "L'administrateur a supprimé votre connaissance."
          : "Le formateur a supprimé votre connaissance.";
    await Notification.create({
      recipient: authorId,
      actor: userId,
      type: "knowledge_deleted",
      message,
      link: "/knowledge",
    });
  }
  await Knowledge.findByIdAndDelete(knowledgeId);
  return { ok: true };
}

async function toggleReaction(userId, knowledgeId) {
  const currentUser = await User.findById(userId).select("status campus class level role").populate("campus class level").populate("role", "name");
  if (!currentUser || currentUser.status !== "active") {
    return { error: { status: 403, message: "Seuls les comptes activés peuvent réagir aux connaissances." } };
  }
  const knowledge = await Knowledge.findById(knowledgeId).populate({
    path: "author",
    select: "campus class level role",
    populate: { path: "role", select: "name" },
  });
  if (!knowledge) return { error: { status: 404, message: "Connaissance introuvable" } };
  const isAuthorSuperAdmin = knowledge.author?.role?.name === "super_admin";
  const isCurrentUserSuperAdmin = currentUser.role?.name === "super_admin";
  if (!isCurrentUserSuperAdmin && !isAuthorSuperAdmin && currentUser.role?.name === "etudiant") {
    const author = knowledge.author;
    const sameContext = haveSameClassContext(currentUser, author);
    const friend = await areFriends(userId, author._id || author);
    if (!sameContext && !friend) {
      return { error: { status: 403, message: "Vous ne pouvez réagir qu'aux connaissances de votre même campus/classe/niveau ou de vos amis." } };
    }
  }
  const existing = await Engagement.findOne({ type: "reaction", user: userId, knowledge: knowledgeId });
  if (existing) {
    await Engagement.deleteOne({ _id: existing._id });
    await Knowledge.findByIdAndUpdate(knowledgeId, { $inc: { reactionCount: -1 } });
    return { data: { removed: true, reactionCount: Math.max(0, (knowledge.reactionCount || 0) - 1) } };
  }
  await Engagement.create({ type: "reaction", user: userId, knowledge: knowledgeId });
  await Knowledge.findByIdAndUpdate(knowledgeId, { $inc: { reactionCount: 1 } });
  return { data: { removed: false, reactionCount: (knowledge.reactionCount || 0) + 1 } };
}

async function toggleShare(userId, knowledgeId) {
  const currentUser = await User.findById(userId).select("status").lean();
  if (!currentUser || currentUser.status !== "active") {
    return { error: { status: 403, message: "Seuls les comptes activés peuvent partager des connaissances." } };
  }
  const knowledge = await Knowledge.findById(knowledgeId);
  if (!knowledge) return { error: { status: 404, message: "Connaissance introuvable" } };
  const authorId = (knowledge.author && knowledge.author.toString ? knowledge.author.toString() : knowledge.author?.toString?.()) || null;
  await Engagement.create({ type: "share", user: userId, knowledge: knowledgeId });
  await Knowledge.findByIdAndUpdate(knowledgeId, { $inc: { shareCount: 1 } });
  if (authorId && authorId !== userId.toString()) {
    const actor = await User.findById(userId).select("name").lean();
    const actorName = actor?.name || "Quelqu'un";
    await Notification.create({
      recipient: authorId,
      actor: userId,
      type: "knowledge_share",
      message: `${actorName} a partagé votre connaissance.`,
      link: `/knowledge?knowledge=${knowledgeId}`,
    });
  }
  return { data: { shareCount: (knowledge.shareCount || 0) + 1 } };
}

module.exports = {
  createKnowledge,
  getAllKnowledge,
  getKnowledgeById,
  updateKnowledge,
  deleteKnowledge,
  toggleReaction,
  toggleShare,
};
