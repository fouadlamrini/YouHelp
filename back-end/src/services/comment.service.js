const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Knowledge = require("../models/Knowledge");
const User = require("../models/User");
const Notification = require("../models/Notification");

function mapFilesToMedia(files) {
  return (files || []).map((file) => {
    let type = "file";
    if (file.mimetype.startsWith("image")) type = "image";
    else if (file.mimetype.startsWith("video")) type = "video";
    else if (file.mimetype === "application/pdf") type = "pdf";
    else if (file.mimetype.includes("word")) type = "doc";
    let folder = "files";
    if (type === "image") folder = "images";
    else if (type === "video") folder = "videos";
    return { url: `/uploads/${folder}/${file.filename}`, type };
  });
}

async function createComment(userId, postId, body, files) {
  const { content, parentComment } = body;
  const post = await Post.findById(postId);
  if (!post) return { error: { status: 404, message: "Post non trouvé" } };
  if (parentComment) {
    const parent = await Comment.findById(parentComment);
    if (!parent) return { error: { status: 404, message: "Commentaire parent non trouvé" } };
    if (parent.parentComment) {
      return { error: { status: 400, message: "On ne peut répondre qu'au commentaire principal." } };
    }
  }
  const mediaFiles = mapFilesToMedia(files);
  const comment = await Comment.create({
    content: (content || "").trim(),
    author: userId,
    post: postId,
    parentComment: parentComment || null,
    media: mediaFiles,
  });
  if (!parentComment) {
    post.comments = post.comments || [];
    post.comments.push(comment._id);
    await post.save();
  }
  const commenterId = userId.toString();
  const postAuthorId = (post.author && post.author.toString ? post.author.toString() : post.author?.toString?.()) || null;
  const actor = await User.findById(userId).select("name").lean();
  const actorName = actor?.name || "Quelqu'un";
  if (!parentComment) {
    if (postAuthorId && postAuthorId !== commenterId) {
      await Notification.create({
        recipient: postAuthorId,
        actor: userId,
        type: "post_comment",
        message: `${actorName} a commenté votre post.`,
        link: `/posts?post=${postId}&comment=${comment._id}`,
      });
    }
  } else {
    const parent = await Comment.findById(parentComment).select("author").lean();
    const parentAuthorId = (parent?.author && parent.author.toString ? parent.author.toString() : parent?.author?.toString?.()) || null;
    if (postAuthorId && postAuthorId !== commenterId) {
      await Notification.create({
        recipient: postAuthorId,
        actor: userId,
        type: "comment_reply",
        message: `${actorName} a répondu à un commentaire sur votre post.`,
        link: `/posts?post=${postId}&comment=${comment._id}`,
      });
    }
    if (parentAuthorId && parentAuthorId !== commenterId && parentAuthorId !== postAuthorId) {
      await Notification.create({
        recipient: parentAuthorId,
        actor: userId,
        type: "comment_reply",
        message: `${actorName} a répondu à votre commentaire.`,
        link: `/posts?post=${postId}&comment=${comment._id}`,
      });
    }
  }
  const populated = await Comment.findById(comment._id).populate("author", "name email profilePicture");
  return { data: populated };
}

function buildTree(comments) {
  const map = {};
  comments.forEach((c) => {
    map[c._id.toString()] = { ...c.toObject(), replies: [] };
  });
  const roots = [];
  comments.forEach((c) => {
    const id = c._id.toString();
    if (c.parentComment) {
      const parentId = c.parentComment.toString();
      if (map[parentId]) map[parentId].replies.push(map[id]);
      else roots.push(map[id]);
    } else roots.push(map[id]);
  });
  const sortRecursive = (arr) => {
    arr.forEach((item) => {
      if (!item.likes) item.likes = [];
      if (item.replies?.length) sortRecursive(item.replies);
    });
    arr.sort((a, b) => (b.likes ? b.likes.length : 0) - (a.likes ? a.likes.length : 0));
  };
  sortRecursive(roots);
  return roots;
}

async function getCommentsByPost(postId) {
  const post = await Post.findById(postId);
  if (!post) return { error: { status: 404, message: "Post non trouvé" } };
  const comments = await Comment.find({ post: postId }).populate("author", "name email profilePicture");
  const roots = buildTree(comments);
  return { data: roots };
}

async function toggleLike(userId, commentId) {
  const comment = await Comment.findById(commentId);
  if (!comment) return { error: { status: 404, message: "Commentaire non trouvé" } };
  const alreadyLiked = comment.likes && comment.likes.some((u) => u.toString() === userId);
  if (alreadyLiked) {
    comment.likes = comment.likes.filter((u) => u.toString() !== userId);
    await comment.save();
    return { data: { totalLikes: comment.likes.length, removed: true } };
  }
  comment.likes = comment.likes || [];
  comment.likes.push(userId);
  await comment.save();
  const commentAuthorId = (comment.author && comment.author.toString ? comment.author.toString() : comment.author?.toString?.()) || null;
  if (commentAuthorId && commentAuthorId !== userId.toString()) {
    const actor = await User.findById(userId).select("name").lean();
    const actorName = actor?.name || "Quelqu'un";
    const isReply = !!comment.parentComment;
    const message = isReply ? `${actorName} a aimé votre réponse.` : `${actorName} a aimé votre commentaire.`;
    const postId = comment.post?.toString?.() || comment.post?.toString?.();
    const knowledgeId = comment.knowledge?.toString?.() || comment.knowledge?.toString?.();
    const link = postId ? `/posts?post=${postId}&comment=${comment._id}` : (knowledgeId ? `/knowledge?knowledge=${knowledgeId}&comment=${comment._id}` : "/posts");
    await Notification.create({ recipient: commentAuthorId, actor: userId, type: "comment_like", message, link });
  }
  return { data: { totalLikes: comment.likes.length, removed: false } };
}

async function updateComment(userId, userRole, commentId, body, files) {
  const comment = await Comment.findById(commentId);
  if (!comment) return { error: { status: 404, message: "Commentaire non trouvé" } };
  const isAdmin = userRole === "admin";
  const isCommentAuthor = comment.author.toString() === userId;
  let isOwner = false;
  if (comment.post) {
    const post = await Post.findById(comment.post);
    if (!post) return { error: { status: 404, message: "Post non trouvé" } };
    isOwner = post.author && post.author.toString() === userId;
  } else if (comment.knowledge) {
    const knowledge = await Knowledge.findById(comment.knowledge);
    if (!knowledge) return { error: { status: 404, message: "Connaissance non trouvée" } };
    isOwner = knowledge.author && knowledge.author.toString() === userId;
  }
  if (!isAdmin && !isCommentAuthor && !isOwner) {
    return { error: { status: 403, message: "Vous n'êtes pas autorisé à modifier ce commentaire" } };
  }
  if (files && files.length) {
    comment.media = mapFilesToMedia(files);
  }
  comment.content = (body.content || "").trim();
  await comment.save();
  const populated = await Comment.findById(comment._id).populate("author", "name email profilePicture");
  return { data: populated };
}

async function deleteComment(userId, userRole, commentId) {
  const comment = await Comment.findById(commentId);
  if (!comment) return { error: { status: 404, message: "Commentaire non trouvé" } };
  const isAdmin = userRole === "admin";
  const isCommentAuthor = comment.author.toString() === userId;
  let isOwner = false;
  if (comment.post) {
    const post = await Post.findById(comment.post);
    if (!post) return { error: { status: 404, message: "Post non trouvé" } };
    isOwner = post.author && post.author.toString() === userId;
  } else if (comment.knowledge) {
    const knowledge = await Knowledge.findById(comment.knowledge);
    if (!knowledge) return { error: { status: 404, message: "Connaissance non trouvée" } };
    isOwner = knowledge.author && knowledge.author.toString() === userId;
  }
  if (!isAdmin && !isCommentAuthor && !isOwner) {
    return { error: { status: 403, message: "Vous n'êtes pas autorisé à supprimer ce commentaire" } };
  }
  const toDelete = [comment._id.toString()];
  for (let i = 0; i < toDelete.length; i++) {
    const parentIds = toDelete.slice(i);
    const children = await Comment.find({ parentComment: { $in: parentIds } }, "_id");
    if (children?.length) children.forEach((c) => toDelete.push(c._id.toString()));
  }
  const result = await Comment.deleteMany({ _id: { $in: toDelete } });
  if (!comment.parentComment) {
    if (comment.post) await Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } });
    else if (comment.knowledge) await Knowledge.findByIdAndUpdate(comment.knowledge, { $pull: { comments: comment._id } });
  }
  if (!comment.parentComment && comment.knowledge) {
    await Knowledge.findByIdAndUpdate(comment.knowledge, { $pull: { comments: comment._id } });
  }
  return { data: { deletedCount: result.deletedCount } };
}

async function createCommentForKnowledge(userId, knowledgeId, body, files) {
  const knowledge = await Knowledge.findById(knowledgeId);
  if (!knowledge) return { error: { status: 404, message: "Connaissance non trouvée" } };
  const { content, parentComment } = body;
  const mediaFiles = mapFilesToMedia(files);
  const comment = await Comment.create({
    content: (content || "").trim(),
    author: userId,
    knowledge: knowledgeId,
    parentComment: parentComment || null,
    media: mediaFiles,
  });
  if (!parentComment) {
    knowledge.comments = knowledge.comments || [];
    knowledge.comments.push(comment._id);
    await knowledge.save();
  }
  const commenterId = userId.toString();
  const knowledgeAuthorId = (knowledge.author && knowledge.author.toString ? knowledge.author.toString() : knowledge.author?.toString?.()) || null;
  const actor = await User.findById(userId).select("name").lean();
  const actorName = actor?.name || "Quelqu'un";
  if (!parentComment) {
    if (knowledgeAuthorId && knowledgeAuthorId !== commenterId) {
      await Notification.create({
        recipient: knowledgeAuthorId,
        actor: userId,
        type: "knowledge_comment",
        message: `${actorName} a commenté votre connaissance.`,
        link: `/knowledge?knowledge=${knowledgeId}&comment=${comment._id}`,
      });
    }
  } else {
    const parent = await Comment.findById(parentComment).select("author").lean();
    const parentAuthorId = (parent?.author && parent.author.toString ? parent.author.toString() : parent?.author?.toString?.()) || null;
    if (knowledgeAuthorId && knowledgeAuthorId !== commenterId) {
      await Notification.create({
        recipient: knowledgeAuthorId,
        actor: userId,
        type: "knowledge_comment_reply",
        message: `${actorName} a répondu à un commentaire sur votre connaissance.`,
        link: `/knowledge?knowledge=${knowledgeId}&comment=${comment._id}`,
      });
    }
    if (parentAuthorId && parentAuthorId !== commenterId && parentAuthorId !== knowledgeAuthorId) {
      await Notification.create({
        recipient: parentAuthorId,
        actor: userId,
        type: "knowledge_comment_reply",
        message: `${actorName} a répondu à votre commentaire.`,
        link: `/knowledge?knowledge=${knowledgeId}&comment=${comment._id}`,
      });
    }
  }
  const populated = await Comment.findById(comment._id).populate("author", "name email profilePicture");
  return { data: populated };
}

async function getCommentsByKnowledge(knowledgeId) {
  const knowledge = await Knowledge.findById(knowledgeId);
  if (!knowledge) return { error: { status: 404, message: "Connaissance non trouvée" } };
  const comments = await Comment.find({ knowledge: knowledgeId }).populate("author", "name email profilePicture");
  const map = {};
  comments.forEach((c) => {
    map[c._id.toString()] = { ...c.toObject(), replies: [] };
  });
  const roots = [];
  comments.forEach((c) => {
    const id = c._id.toString();
    if (c.parentComment) {
      const parentId = c.parentComment.toString();
      if (map[parentId]) map[parentId].replies.push(map[id]);
      else roots.push(map[id]);
    } else roots.push(map[id]);
  });
  const sortRecursive = (arr) => {
    arr.forEach((item) => {
      if (item.replies?.length) sortRecursive(item.replies);
    });
    arr.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
  };
  sortRecursive(roots);
  return { data: roots };
}

module.exports = {
  createComment,
  getCommentsByPost,
  toggleLike,
  updateComment,
  deleteComment,
  createCommentForKnowledge,
  getCommentsByKnowledge,
};
