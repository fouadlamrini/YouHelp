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

async function postsAuthorFilter(userId) {
  const current = await User.findById(userId).populate("campus class level").populate("role", "name");
  if (!current) return { _id: -1 };
  const roleName = current.role?.name ?? null;
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

async function sameContextReactionCount(postId, authorId) {
  const author = await User.findById(authorId).select("campus class level");
  if (!author || (!author.campus && !author.class && !author.level)) return 0;
  const filter = {};
  if (author.campus) filter.campus = author.campus;
  if (author.class) filter.class = author.class;
  if (author.level) filter.level = author.level;
  const userIds = await User.find(filter).distinct("_id");
  return Engagement.countDocuments({ type: "reaction", post: postId, user: { $in: userIds } });
}

async function totalSameContextCount(authorId) {
  const author = await User.findById(authorId).select("campus class level");
  if (!author || (!author.campus && !author.class && !author.level)) return 0;
  const filter = {};
  if (author.campus) filter.campus = author.campus;
  if (author.class) filter.class = author.class;
  if (author.level) filter.level = author.level;
  return User.countDocuments(filter);
}

function sameContextAsAuthor(currentUser, post) {
  const author = post.author?.toObject ? post.author : post.author;
  if (!author?.campus && !author?.class && !author?.level) return false;
  const sameCampus = !!(currentUser.campus && author?.campus &&
    (currentUser.campus._id?.toString() || currentUser.campus.toString()) === (author.campus?._id?.toString() || author.campus?.toString()));
  const sameClass = !!(currentUser.class && author?.class &&
    (currentUser.class._id?.toString() || currentUser.class.toString()) === (author.class?._id?.toString() || author.class?.toString()));
  const sameLevel = !!(currentUser.level && author?.level &&
    (currentUser.level._id?.toString() || currentUser.level.toString()) === (author.level?._id?.toString() || author.level?.toString()));
  return sameCampus && sameClass && sameLevel;
}

async function canModeratePost(currentUserId, currentUser, post) {
  if (!currentUserId || !currentUser) return false;
  const roleName = currentUser.role?.name ?? currentUser.role ?? null;
  if (roleName === "super_admin") return true;
  const authorId = post.author?._id?.toString() || post.author?.toString();
  if (authorId === currentUserId.toString()) return true;
  if (roleName !== "admin" && roleName !== "formateur") return false;
  const author = post.author?.toObject ? post.author : await User.findById(post.author).populate("role", "name").populate("campus class level").lean();
  if (!author) return false;
  const authorRoleName = author?.role?.name ?? author?.role ?? null;
  const sameCampus = [currentUser.campus?._id ?? currentUser.campus, author.campus?._id ?? author.campus].every(Boolean) &&
    (currentUser.campus?._id ?? currentUser.campus).toString() === (author.campus?._id ?? author.campus).toString();
  if (roleName === "admin") {
    if (authorRoleName !== "etudiant" && authorRoleName !== "formateur") return false;
    return sameCampus;
  }
  if (roleName === "formateur") {
    if (authorRoleName !== "etudiant") return false;
    const sameClass = [currentUser.class?._id ?? currentUser.class, author.class?._id ?? author.class].every(Boolean) && (currentUser.class?._id ?? currentUser.class).toString() === (author.class?._id ?? author.class).toString();
    const sameLevel = [currentUser.level?._id ?? currentUser.level, author.level?._id ?? author.level].every(Boolean) && (currentUser.level?._id ?? currentUser.level).toString() === (author.level?._id ?? author.level).toString();
    return sameCampus && sameClass && sameLevel;
  }
  return false;
}

async function postCanReact(currentUserId, currentUser, post, viewFilter) {
  if (currentUser.status !== "active") return false;
  const authorId = post.author?._id || post.author;
  if (!authorId) return false;
  if (currentUserId.toString() === authorId.toString()) return true;
  const author = post.author?.toObject ? post.author.toObject() : post.author;
  if (currentUser.role?.name === "super_admin") return true;
  if (author?.role?.name === "super_admin") return true;
  if (viewFilter === "friends") return true;
  const sameCampus = currentUser.campus && author?.campus &&
    (currentUser.campus._id?.toString() || currentUser.campus.toString()) === (author.campus?._id?.toString() || author.campus?.toString());
  const sameClass = currentUser.class && author?.class &&
    (currentUser.class._id?.toString() || currentUser.class.toString()) === (author.class?._id?.toString() || author.class?.toString());
  const sameLevel = currentUser.level && author?.level &&
    (currentUser.level._id?.toString() || currentUser.level.toString()) === (author.level?._id?.toString() || author.level?.toString());
  const sameContext = sameCampus && sameClass && sameLevel;
  if (viewFilter === "my_campus") return sameContext;
  const friend = await areFriends(currentUserId, authorId);
  return sameContext || friend;
}

async function createPost(userId, body, mediaFiles) {
  const currentUser = await User.findById(userId).select("status").lean();
  if (currentUser?.status !== "active") {
    return { error: { status: 403, message: "Seuls les comptes activés peuvent créer des posts." } };
  }
  const { content, category, subCategory } = body;
  const categoryDoc = await Category.findOne({ name: category });
  if (!categoryDoc) return { error: { status: 400, message: "Category not found" } };
  let subCategoryId = null;
  if (subCategory) {
    const subCategoryDoc = await SubCategory.findOne({ name: subCategory, category: categoryDoc._id });
    if (!subCategoryDoc) return { error: { status: 400, message: "SubCategory not found" } };
    subCategoryId = subCategoryDoc._id;
  }
  const post = await Post.create({
    content,
    author: userId,
    category: categoryDoc._id,
    subCategory: subCategoryId,
    media: mediaFiles || [],
  });
  return { data: post };
}

async function getAllPosts(userId, queryFilter) {
  const filter = (queryFilter || "all").toLowerCase();
  const allowedFilters = ["all", "friends", "my_campus"];
  const viewFilter = allowedFilters.includes(filter) ? filter : "all";

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
      const campusId = currentUser.campus?._id || currentUser.campus;
      if (campusId) {
        const sameCampusIds = await User.find({ campus: campusId }).distinct("_id");
        if (sameCampusIds.length === 0) noAuthors = true;
        else authorFilter = { author: { $in: sameCampusIds } };
      }
    }
  }

  if (noAuthors) return { data: [] };

  const posts = await Post.find(authorFilter)
    .sort({ createdAt: -1 })
    .populate({ path: "author", select: "name email campus class level profilePicture role", populate: { path: "role", select: "name" } })
    .populate("category", "name")
    .populate("subCategory", "name")
    .populate("comments");

  const withMeta = await Promise.all(
    posts.map(async (p) => {
      const authorId = p.author?._id || p.author;
      const reactionCount = await sameContextReactionCount(p._id, authorId);
      const totalSameContext = await totalSameContextCount(authorId);
      const commentCount = await Comment.countDocuments({ post: p._id });
      const canReact = await postCanReact(userId, currentUser, p, viewFilter);
      const canModerate = await canModeratePost(userId, currentUser, p);
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
    const scCount = await sameContextReactionCount(postId, post.author?._id || post.author);
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
    const authorId = post.author?._id?.toString() || post.author?.toString();
    const allowed = authorFilter.author.$in.some((id) => id.toString() === authorId);
    if (!allowed) return { error: { status: 403, message: "Forbidden" } };
  }

  const fullUser = await User.findById(userId).select("status campus class level role").populate("campus class level").populate("role", "name");
  const authorId = post.author?._id || post.author;
  const reactionCount = await sameContextReactionCount(postId, authorId);
  const totalSameContext = await totalSameContextCount(authorId);
  const commentCount = await Comment.countDocuments({ post: postId });
  const canReact = await postCanReact(userId, fullUser, post, "all");
  const canModerate = await canModeratePost(userId, fullUser, post);
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
  } catch (e) {
    console.error("Error parsing existingMedia for post update:", e);
  }
  const post = await Post.findByIdAndUpdate(postId, updateData, { new: true, runValidators: true });
  if (!post) return { error: { status: 404, message: "Post not found" } };
  return { data: post };
}

async function deletePost(deleterId, postId) {
  const post = await Post.findById(postId).populate({ path: "author", populate: { path: "role", select: "name" }, select: "campus class level role" });
  if (!post) return { error: { status: 404, message: "Post not found" } };
  const authorId = (post.author?._id || post.author)?.toString?.();
  if (authorId && authorId !== deleterId) {
    const actorDoc = await User.findById(deleterId).populate("role", "name").lean();
    const authorDoc = post.author?.toObject ? post.author : await User.findById(post.author).populate("campus class level").lean();
    await notifyPostDeleted(actorDoc || { _id: deleterId, name: "?", role: null }, authorDoc || { _id: post.author, campus: null, class: null, level: null }, postId);
  }
  await Post.findByIdAndDelete(postId);
  await Engagement.deleteMany({ post: postId });
  return { ok: true };
}

async function canToggleSolved(userId, post) {
  const me = await User.findById(userId).populate("role", "name").populate("campus class level").lean();
  if (!me) return false;
  const roleName = me.role?.name ?? null;
  if (roleName === "super_admin") return true;
  const authorId = post.author?._id?.toString() || post.author?.toString();
  if (authorId === userId.toString()) return true;
  if (roleName !== "admin" && roleName !== "formateur") return false;
  const author = post.author?.toObject ? post.author : await User.findById(post.author).populate("role", "name").populate("campus class level").lean();
  if (!author) return false;
  const authorRoleName = author?.role?.name ?? author?.role ?? null;
  const sameCampus = [me.campus?._id ?? me.campus, author.campus?._id ?? author.campus].every(Boolean) &&
    (me.campus?._id ?? me.campus).toString() === (author.campus?._id ?? author.campus).toString();
  if (roleName === "admin") {
    if (authorRoleName !== "etudiant" && authorRoleName !== "formateur") return false;
    return sameCampus;
  }
  if (roleName === "formateur") {
    if (authorRoleName !== "etudiant") return false;
    const sameClass = [me.class?._id ?? me.class, author.class?._id ?? author.class].every(Boolean) && (me.class?._id ?? me.class).toString() === (author.class?._id ?? author.class).toString();
    const sameLevel = [me.level?._id ?? me.level, author.level?._id ?? author.level].every(Boolean) && (me.level?._id ?? me.level).toString() === (author.level?._id ?? author.level).toString();
    return sameCampus && sameClass && sameLevel;
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
  const postAuthorId = post.author?._id?.toString() || post.author?.toString();
  if (postAuthorId && postAuthorId !== userId.toString()) {
    const actorDoc = await User.findById(userId).populate("role", "name").lean();
    const authorDoc = post.author?.toObject ? post.author : await User.findById(post.author).populate("campus class level").lean();
    await notifyPostSolved(actorDoc || { _id: userId, name: "?", role: null }, authorDoc || { _id: post.author, campus: null, class: null, level: null }, postId);
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
  const roleName = me?.role?.name ?? null;
  const isAuthorSuperAdmin = post.author?.role?.name === "super_admin";
  if (roleName !== "super_admin" && !isAuthorSuperAdmin && roleName === "etudiant") {
    const author = await User.findById(post.author._id || post.author).populate("campus class level");
    const sameCampus = me.campus && author?.campus && me.campus._id.toString() === author.campus._id.toString();
    const sameClass = me.class && author?.class && me.class._id.toString() === author.class._id.toString();
    const sameLevel = me.level && author?.level && me.level._id.toString() === author.level._id.toString();
    const sameContext = sameCampus && sameClass && sameLevel;
    const friend = await areFriends(userId, post.author._id || post.author);
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
  const authorId = (post.author?._id || post.author)?.toString?.();
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
    .populate({
      path: "knowledge",
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
        const reactionCount = await sameContextReactionCount(post._id, post.author?._id || post.author);
        const commentCount = await Comment.countDocuments({ post: post._id });
        return { _id: e._id, sharedAt: e.createdAt, post: { ...post, sameContextReactionCount: reactionCount, commentCount } };
      }
      if (e.knowledge) {
        const knowledge = e.knowledge;
        const commentCount = await Comment.countDocuments({ knowledge: knowledge._id });
        return { _id: e._id, sharedAt: e.createdAt, knowledge: { ...knowledge, commentCount } };
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
  const authorId = (post.author && post.author.toString ? post.author.toString() : post.author?.toString?.()) || null;
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
  return { data: { totalShares: updated?.shareCount ?? post.shareCount + 1 } };
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
