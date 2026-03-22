const Post = require("../models/Post");
const User = require("../models/User");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Comment = require("../models/Comment");
const Engagement = require("../models/Engagement");
const Solution = require("../models/Solution");
const Notification = require("../models/Notification");
const WorkshopRequest = require("../models/WorkshopRequest");
const { notifyPostDeleted, notifyPostSolved } = require("./notification.service");
const { areFriends, getMyFriendIds } = require("./friend.service");
const { haveSameClassContext } = require("../utils/contextUtils");

// Helper: calcule le filtre des auteurs accessibles selon le role, le contexte et les amis.
async function postsAuthorFilter(userId) {
  const current = await User.findById(userId).populate("campus class level").populate("role", "name");
  if (!current) return { _id: -1 };
  const roleName = current.role?.name || null;
  if (roleName === "super_admin") return {};
  if (roleName === "admin") {
    if (!current.campus) return {};
    const authorIds = await User.find({ campus: current.campus._id }).distinct("_id");
    return { author: { $in: authorIds } };
  }
  if (roleName === "formateur" || roleName === "etudiant") {
    const filter = {};
    if (current.campus) filter.campus = current.campus._id;
    if (current.class) filter.class = current.class._id;
    if (current.level) filter.level = current.level._id;
    const sameContextIds = await User.find(filter).distinct("_id");
    const myFriendIds = await getMyFriendIds(userId);
    const authorIds = [...new Set([...sameContextIds.map(String), ...myFriendIds])];
    return { author: { $in: authorIds } };
  }
  return { _id: -1 };
}

// Helper: compte le nombre de reactions d'utilisateurs dans le meme contexte pour un post donne.
async function sameContextReactionCount(postId, authorId) {
  const author = await User.findById(authorId)
    .select("campus class level")
    .populate("class", "nickName")
    .lean();

  const campusId = author?.campus;
  const levelId = author?.level;
  const classId = author?.class?._id;
  const nickName = author?.class?.nickName;

  if (!campusId || !levelId || !classId || !nickName) return 0;

  const users = await User.find({ campus: campusId, class: classId, level: levelId })
    .select("_id class")
    .populate("class", "nickName")
    .lean();

  const userIds = users
    .filter((u) => u?.class?.nickName === nickName)
    .map((u) => u._id);

  if (userIds.length === 0) return 0;

  return Engagement.countDocuments({
    type: "reaction",
    post: postId,
    user: { $in: userIds },
  });
}

// Helper: calcule le nombre total d'utilisateurs dans le meme contexte que l'auteur.
async function totalSameContextCount(authorId) {
  const author = await User.findById(authorId)
    .select("campus class level")
    .populate("class", "nickName")
    .lean();

  const campusId = author?.campus;
  const levelId = author?.level;
  const classId = author?.class?._id;
  const nickName = author?.class?.nickName;

  if (!campusId || !levelId || !classId || !nickName) return 0;

  const users = await User.find({ campus: campusId, class: classId, level: levelId })
    .select("_id class")
    .populate("class", "nickName")
    .lean();

  return users.filter((u) => u?.class?.nickName === nickName).length;
}

// Helper: determine si le currentUser partage le meme contexte que l'auteur du post.
function sameContextAsAuthor(currentUser, post) {
  const author = post.author;
  return haveSameClassContext(currentUser, author || {});
}

// Helper: verifie si un utilisateur peut moderer le post selon le role et le contexte.
async function canModeratePost(currentUser, post) {
  if (!currentUser?._id) return false;
  const currentUserId = String(currentUser._id);
  const roleName = currentUser.role?.name || null;
  if (roleName === "super_admin") return true;
  const authorId = post.author?._id?.toString();
  if (authorId === currentUserId) return true;
  if (roleName !== "admin" && roleName !== "formateur") return false;
  const author = post.author;
  if (!author) return false;
  const authorRoleName = author.role?.name || null;
  const currentCampusId = currentUser.campus?._id;
  const authorCampusId = author.campus?._id;
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

// Helper: verifie si le currentUser peut reagir a un post selon les regles et le filtre choisi.
async function postCanReact(currentUser, post, viewFilter) {
  if (!currentUser?._id) return false;
  const currentUserId = String(currentUser._id);
  if (currentUser.status !== "active") return false;
  const authorId = post.author?._id;
  if (!authorId) return false;
  if (currentUserId === authorId.toString()) return true;
  const author = post.author;
  if (currentUser.role?.name === "super_admin") return true;
  if (author?.role?.name === "super_admin") return true;
  if (viewFilter === "friends") return true;
  const sameContext = haveSameClassContext(currentUser, author || {});
  if (viewFilter === "my_campus") return sameContext;
  const friend = await areFriends(currentUserId, authorId);
  return sameContext || friend;
}

async function createPost(userId, body, mediaFiles) {
  const currentUser = await User.findById(userId).select("status").lean();
  if (currentUser?.status !== "active") {
    return { error: { status: 403, message: "Seuls les comptes activés peuvent créer des posts." } };
  }
  const { content, category, subCategory, type } = body;
  const categoryDoc = await Category.findOne({ name: category });
  if (!categoryDoc) return { error: { status: 400, message: "Category not found" } };
  let subCategoryId = null;
  if (subCategory) {
    const subCategoryDoc = await SubCategory.findOne({ name: subCategory, category: categoryDoc._id });
    if (!subCategoryDoc) return { error: { status: 400, message: "SubCategory not found" } };
    subCategoryId = subCategoryDoc._id;
  }
  const post = await Post.create({
    type: type === "knowledge" ? "knowledge" : "post",
    content,
    author: userId,
    category: categoryDoc._id,
    subCategory: subCategoryId,
    media: mediaFiles || [],
  });
  return { data: post };
}

async function getAllPosts(userId, queryFilter, contentType) {
  const filter = (queryFilter || "all").toLowerCase();
  const allowedFilters = ["all", "friends", "my_campus"];
  const viewFilter = allowedFilters.includes(filter) ? filter : "all";
  const type = contentType === "knowledge" ? "knowledge" : "post";

  const currentUser = await User.findById(userId)
    .select("status campus class level role")
    .populate("campus class level")
    .populate("role", "name");
  if (!currentUser) return { error: { status: 403, message: "User not found" } };

  let authorFilter = {};
  let noAuthors = false;
  if (currentUser.status === "active") {
    const friendIds = await getMyFriendIds(userId);
    if (viewFilter === "friends") {
      if (friendIds.length === 0) noAuthors = true;
      else authorFilter = { author: { $in: friendIds } };
    } else if (viewFilter === "my_campus") {
      const campusId = currentUser.campus?._id;
      if (campusId) {
        const sameCampusIds = await User.find({ campus: campusId }).distinct("_id");
        if (sameCampusIds.length === 0) noAuthors = true;
        else authorFilter = { author: { $in: sameCampusIds } };
      }
    }
  } else {
    
    if (viewFilter === "friends") {
      noAuthors = true;
    } else if (viewFilter === "my_campus") {
      const campusId = currentUser.campus?._id;
      if (campusId) {
        const sameCampusIds = await User.find({ campus: campusId }).distinct("_id");
        if (sameCampusIds.length === 0) noAuthors = true;
        else authorFilter = { author: { $in: sameCampusIds } };
      }
    }
  }

  if (noAuthors) return { data: [] };

  const posts = await Post.find({ ...authorFilter, type })
    .sort({ createdAt: -1 })
    .populate({ path: "author", select: "name email campus class level profilePicture role", populate: { path: "role", select: "name" } })
    .populate("category", "name")
    .populate("subCategory", "name")
    .populate("comments");

  const withMeta = await Promise.all(
    posts.map(async (p) => {
      const authorId = p.author?._id;
      const reactionCount = await sameContextReactionCount(p._id, authorId);
      const totalSameContext = await totalSameContextCount(authorId);
      const commentCount = await Comment.countDocuments({ post: p._id });
      const canReact = await postCanReact(currentUser, p, viewFilter);
      const canModerate = await canModeratePost(currentUser, p);
      const sameContextAsAuthorFlag = sameContextAsAuthor(currentUser, p);
      const showDemandeWorkchopButton = totalSameContext > 0 && reactionCount >= totalSameContext * 0.5;
      const workchopRequestAlreadySent = showDemandeWorkchopButton
        ? !!(await WorkshopRequest.findOne({ user: userId, post: p._id }))
        : false;
      return {
        ...p.toObject(),
        sameContextReactionCount: reactionCount,
        totalSameContext,
        commentCount,
        canReact,
        canModerate,
        sameContextAsAuthor: sameContextAsAuthorFlag,
        showDemandeWorkchopButton,
        workchopRequestAlreadySent,
      };
    })
  );
  return { data: withMeta };
}

async function getPostById(userId, postId) {
  const post = await Post.findById(postId)
    .populate({ path: "author", select: "name email campus class level profilePicture role", populate: { path: "role", select: "name" } })
    .populate("category", "name")
    .populate("subCategory", "name")
    .populate("comments");
  if (!post) return { error: { status: 404, message: "Post not found" } };

  const currentUser = await User.findById(userId).select("status").lean();
  if (currentUser?.status !== "active") {
    const scCount = await sameContextReactionCount(postId, post.author?._id);
    const commentCount = await Comment.countDocuments({ post: postId });
    return {
      data: {
        ...post.toObject(),
        sameContextReactionCount: scCount,
        commentCount,
        canReact: false,
        showDemandeWorkchopButton: false,
        sameContextAsAuthor: false,
        workchopRequestAlreadySent: false,
      },
    };
  }

  const authorFilter = await postsAuthorFilter(userId);
  if (authorFilter._id === -1) return { error: { status: 403, message: "Forbidden" } };
  if (authorFilter.author?.$in) {
    const authorId = post.author?._id?.toString();
    const allowed = authorFilter.author.$in.some((id) => id.toString() === authorId);
    if (!allowed) return { error: { status: 403, message: "Forbidden" } };
  }

  const fullUser = await User.findById(userId).select("status campus class level role").populate("campus class level").populate("role", "name");
  const authorId = post.author?._id;
  const reactionCount = await sameContextReactionCount(postId, authorId);
  const totalSameContext = await totalSameContextCount(authorId);
  const commentCount = await Comment.countDocuments({ post: postId });
  const canReact = await postCanReact(fullUser, post, "all");
  const canModerate = await canModeratePost(fullUser, post);
  const sameContextAsAuthorFlag = sameContextAsAuthor(fullUser, post);
  const showDemandeWorkchopButton = totalSameContext > 0 && reactionCount >= totalSameContext * 0.5;
  const workchopRequestAlreadySent = showDemandeWorkchopButton
    ? !!(await WorkshopRequest.findOne({ user: userId, post: postId }))
    : false;

  return {
    data: {
      ...post.toObject(),
      sameContextReactionCount: reactionCount,
      totalSameContext,
      commentCount,
      canReact,
      canModerate,
      sameContextAsAuthor: sameContextAsAuthorFlag,
      showDemandeWorkchopButton,
      workchopRequestAlreadySent,
    },
  };
}

// Helper: convertit existingMedia (null/string/json) en tableau.
function parseExistingMedia(existingMediaRaw) {
  if (!existingMediaRaw) return [];
  if (Array.isArray(existingMediaRaw)) return existingMediaRaw;
  if (typeof existingMediaRaw === "string") return JSON.parse(existingMediaRaw || "[]");
  return [];
}

async function updatePost(postId, body, uploadedMedia) {
  const { category, subCategory, ...rest } = body;
  let updateData = { ...rest };
  if (category) {
    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) return { error: { status: 400, message: "Category not found" } };
    updateData.category = categoryDoc._id;
    if (subCategory) {
      const subCategoryDoc = await SubCategory.findOne({ name: subCategory, category: categoryDoc._id });
      if (!subCategoryDoc) return { error: { status: 400, message: "SubCategory not found" } };
      updateData.subCategory = subCategoryDoc._id;
    }
  }
  try {
    const existingMedia = parseExistingMedia(body.existingMedia);
    if (existingMedia.length || (uploadedMedia && uploadedMedia.length)) {
      updateData.media = [...existingMedia, ...(uploadedMedia || [])];
    }
  } catch {}
  const post = await Post.findByIdAndUpdate(postId, updateData, { new: true, runValidators: true });
  if (!post) return { error: { status: 404, message: "Post not found" } };
  return { data: post };
}

async function deletePost(deleterId, postId) {
  const post = await Post.findById(postId).populate({ path: "author", populate: { path: "role", select: "name" }, select: "campus class level role" });
  if (!post) return { error: { status: 404, message: "Post not found" } };
  const authorId = post.author?._id?.toString();
  if (authorId && authorId !== deleterId) {
    const actorDoc = await User.findById(deleterId).populate("role", "name").lean();
    await notifyPostDeleted(actorDoc || { _id: deleterId, name: "?", role: null }, post.author || { _id: post.author, campus: null, class: null, level: null }, postId);
  }
  await Post.findByIdAndDelete(postId);
  await Engagement.deleteMany({ post: postId });
  return { ok: true };
}

// Helper: verifie si l'utilisateur peut basculer le statut "resolu" du post.
async function canToggleSolved(userId, post) {
  const me = await User.findById(userId).populate("role", "name").populate("campus class level").lean();
  if (!me) return false;
  const roleName = me.role?.name || null;
  if (roleName === "super_admin") return true;
  const authorId = post.author?._id?.toString();
  if (authorId === userId.toString()) return true;
  if (roleName !== "admin" && roleName !== "formateur") return false;
  const author = post.author;
  if (!author) return false;
  const authorRoleName = author.role?.name || null;
  const meCampusId = me.campus?._id;
  const authorCampusId = author.campus?._id;
  const sameCampus =
    meCampusId &&
    authorCampusId &&
    meCampusId.toString() === authorCampusId.toString();
  if (roleName === "admin") {
    if (authorRoleName !== "etudiant" && authorRoleName !== "formateur") return false;
    return sameCampus;
  }
  if (roleName === "formateur") {
    if (authorRoleName !== "etudiant") return false;
    return haveSameClassContext(me, author);
  }
  return false;
}

async function toggleSolved(userId, postId, body) {
  const post = await Post.findById(postId).populate({ path: "author", populate: { path: "role", select: "name" }, select: "campus class level role" });
  if (!post) return { error: { status: 404, message: "Post not found" } };
  const allowed = await canToggleSolved(userId, post);
  if (!allowed) {
    return { error: { status: 403, message: "Vous n'êtes pas autorisé à modifier le statut résolu de ce post" } };
  }
  if (post.isSolved) {
    await Solution.deleteOne({ post: postId });
    await Post.findByIdAndUpdate(postId, { isSolved: false });
    return { data: { isSolved: false }, message: "Post marqué comme non résolu" };
  }
  const rawDescription = body?.description;
  const description = typeof rawDescription === "string" && rawDescription.trim().length > 0 ? rawDescription.trim() : "Marqué comme résolu";
  await Solution.create({ post: postId, description, markedBy: userId });
  await Post.findByIdAndUpdate(postId, { isSolved: true });
  const postAuthorId = post.author?._id?.toString();
  if (postAuthorId && postAuthorId !== userId.toString()) {
    const actorDoc = await User.findById(userId).populate("role", "name").lean();
    await notifyPostSolved(actorDoc || { _id: userId, name: "?", role: null }, post.author || { _id: post.author, campus: null, class: null, level: null }, postId);
  }
  return { data: { isSolved: true }, message: "Post marqué comme résolu" };
}

async function toggleReaction(userId, postId) {
  const currentUser = await User.findById(userId).select("status").lean();
  if (currentUser?.status !== "active") {
    return { error: { status: 403, message: "Seuls les comptes activés peuvent réagir aux posts." } };
  }
  const post = await Post.findById(postId).populate({ path: "author", populate: { path: "role", select: "name" } });
  if (!post) return { error: { status: 404, message: "Post not found" } };
  const me = await User.findById(userId).populate("role", "name").populate("campus class level");
  const roleName = me?.role?.name || null;
  const isAuthorSuperAdmin = post.author?.role?.name === "super_admin";
  if (roleName !== "super_admin" && !isAuthorSuperAdmin && roleName === "etudiant") {
    const author = await User.findById(post.author._id).populate("campus class level");
    const sameContext = haveSameClassContext(me, author);
    const friend = await areFriends(userId, post.author._id);
    if (!sameContext && !friend) {
      return { error: { status: 403, message: "You can only react to posts from same campus/class/level or from friends" } };
    }
  }
  const existing = await Engagement.findOne({ type: "reaction", user: userId, post: postId });
  if (existing) {
    await Engagement.deleteOne({ _id: existing._id });
    await Post.findByIdAndUpdate(postId, { $inc: { reactionCount: -1 } });
    return { data: { removed: true, totalReactions: Math.max(0, (post.reactionCount || 0) - 1) } };
  }
  await Engagement.create({ type: "reaction", user: userId, post: postId });
  await Post.findByIdAndUpdate(postId, { $inc: { reactionCount: 1 } });
  const authorId = post.author?._id?.toString();
  if (authorId && authorId !== userId.toString()) {
    const actor = await User.findById(userId).select("name").lean();
    const actorName = actor?.name || "Quelqu'un";
    await Notification.create({
      recipient: authorId,
      actor: userId,
      type: "post_reaction",
      message: `${actorName} a réagi à votre post (même problème).`,
      link: `/posts?post=${postId}`,
    });
  }
  return { data: { removed: false, totalReactions: (post.reactionCount || 0) + 1 } };
}

async function getMySharedPosts(userId) {
  const engagements = await Engagement.find({ type: "share", user: userId })
    .sort({ createdAt: -1 })
    .populate({
      path: "post",
      populate: [
        { path: "author", select: "name email campus class level profilePicture" },
        { path: "category", select: "name" },
        { path: "subCategory", select: "name" },
      ],
    })
    .lean();
  const withMeta = await Promise.all(
    engagements.map(async (e) => {
      if (e.post) {
        const post = e.post;
        const reactionCount = await sameContextReactionCount(post._id, post.author?._id);
        const commentCount = await Comment.countDocuments({ post: post._id });
        return { _id: e._id, sharedAt: e.createdAt, post: { ...post, sameContextReactionCount: reactionCount, commentCount } };
      }
      return null;
    })
  );
  return { data: withMeta.filter(Boolean) };
}

async function deleteShare(userId, shareId) {
  const engagement = await Engagement.findOne({ _id: shareId, type: "share", user: userId });
  if (!engagement) return { error: { status: 404, message: "Partage introuvable" } };
  const postId = engagement.post;
  await Engagement.deleteOne({ _id: engagement._id });
  if (postId) await Post.findByIdAndUpdate(postId, { $inc: { shareCount: -1 } });
  return { ok: true };
}

async function toggleShare(userId, postId) {
  const currentUser = await User.findById(userId).select("status").lean();
  if (currentUser?.status !== "active") {
    return { error: { status: 403, message: "Seuls les comptes activés peuvent partager des posts." } };
  }
  const post = await Post.findById(postId);
  if (!post) return { error: { status: 404, message: "Post introuvable" } };
  const authorId = post.author?.toString() || null;
  await Engagement.create({ type: "share", user: userId, post: postId });
  const updated = await Post.findByIdAndUpdate(postId, { $inc: { shareCount: 1 } }, { new: true });
  if (authorId && authorId !== userId.toString()) {
    const actor = await User.findById(userId).select("name").lean();
    const actorName = actor?.name || "Quelqu'un";
    await Notification.create({
      recipient: authorId,
      actor: userId,
      type: "post_share",
      message: `${actorName} a partagé votre post.`,
      link: `/posts?post=${postId}`,
    });
  }
  return { data: { totalShares: updated ? updated.shareCount : post.shareCount + 1 } };
}

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleSolved,
  toggleReaction,
  getMySharedPosts,
  deleteShare,
  toggleShare,
};
