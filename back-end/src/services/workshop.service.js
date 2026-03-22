const Workshop = require("../models/Workshop");
const WorkshopRequest = require("../models/WorkshopRequest");
const User = require("../models/User");
const Post = require("../models/Post");
const Engagement = require("../models/Engagement");
const Notification = require("../models/Notification");
const Role = require("../models/Role");
const { haveSameClassContext } = require("../utils/contextUtils");

// Helper: verifie si deux users (ou un user + l'auteur) partagent le meme contexte scolaire.
function sameContextAsAuthor(me, author) {
  return haveSameClassContext(me, author);
}

async function createWorkshop(userId, body) {
  const { title, description, date } = body;
  const workshop = await Workshop.create({
    title: (title || "").trim(),
    description: description?.trim(),
    date: date ? new Date(date) : undefined,
    createdBy: userId,
  });
  return { data: workshop };
}

async function getAllWorkshops() {
  const workshops = await Workshop.find()
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });
  return { data: workshops };
}

async function requestWorkshop(userId, workshopId) {
  const workshop = await Workshop.findById(workshopId);
  if (!workshop) return { error: { status: 404, message: "Workshop not found" } };
  const existing = await WorkshopRequest.findOne({ user: userId, workshop: workshopId });
  if (existing) {
    if (existing.status === "pending") return { error: { status: 400, message: "You already have a pending request for this workshop" } };
    if (existing.status === "accepted") return { error: { status: 400, message: "You are already accepted for this workshop" } };
  }
  const request = await WorkshopRequest.create({ user: userId, workshop: workshopId, status: "pending" });
  const populated = await WorkshopRequest.findById(request._id)
    .populate("user", "name email")
    .populate("workshop", "title date");
  return { data: populated };
}

async function getMyRequests(userId) {
  const requests = await WorkshopRequest.find({ user: userId })
    .populate("workshop", "title description date")
    .sort({ createdAt: -1 });
  return { data: requests };
}

async function requestFromPost(userId, body) {
  const { postId } = body;
  const post = await Post.findById(postId).populate("author", "campus class level");
  if (!post) return { error: { status: 404, message: "Post not found" } };
  const author = post.author;
  const me = await User.findById(userId).select("campus class level").populate("campus class level");
  if (!sameContextAsAuthor(me, author)) {
    return { error: { status: 403, message: "Vous devez avoir le même campus, classe et niveau que l'auteur du post." } };
  }
  const totalSameContext = await User.countDocuments({
    campus: author?.campus,
    class: author?.class,
    level: author?.level,
  });
  if (totalSameContext === 0) return { error: { status: 400, message: "Contexte invalide." } };
  const sameContextUserIds = await User.find({
    campus: author?.campus,
    class: author?.class,
    level: author?.level,
  }).distinct("_id");
  const sameContextReactionCount = await Engagement.countDocuments({
    type: "reaction",
    post: postId,
    user: { $in: sameContextUserIds },
  });
  if (sameContextReactionCount < totalSameContext * 0.5) {
    return { error: { status: 400, message: "La demande de workchop n'est possible que si au moins 50% des étudiants du même contexte ont réagi au post." } };
  }
  const existing = await WorkshopRequest.findOne({ user: userId, post: postId });
  if (existing) {
    if (existing.status === "pending") return { error: { status: 400, message: "Vous avez déjà une demande en attente pour ce post." } };
    if (existing.status === "accepted") return { error: { status: 400, message: "Votre demande a déjà été acceptée." } };
  }
  const request = await WorkshopRequest.create({ user: userId, post: postId, status: "pending" });
  const populated = await WorkshopRequest.findById(request._id)
    .populate("user", "name email profilePicture")
    .populate("post", "content");
  const student = await User.findById(userId).select("name").lean();
  const studentName = student?.name || "Un étudiant";
  const campusId = me.campus?._id;
  const classId = me.class?._id;
  const levelId = me.level?._id;
  const formateurRole = await Role.findOne({ name: "formateur" });
  if (formateurRole && campusId && classId && levelId) {
    const formateurs = await User.find({
      role: formateurRole._id,
      campus: campusId,
      class: classId,
      level: levelId,
    }).select("_id").lean();
    const notifications = formateurs.map((f) => ({
      recipient: f._id,
      actor: userId,
      type: "workchop_request",
      message: `${studentName} a demandé un workchop pour un post.`,
      link: "/Shedule",
    }));
    if (notifications.length) await Notification.insertMany(notifications);
  }
  return { data: populated };
}

async function getPendingForFormateur(userId) {
  const me = await User.findById(userId).select("campus class level").populate("campus class level");
  const requests = await WorkshopRequest.find({ post: { $ne: null }, status: "pending" })
    .populate("user", "name email profilePicture")
    .populate({ path: "post", select: "content", populate: { path: "author", select: "name campus class level" } })
    .sort({ createdAt: -1 });
  const filtered = requests.filter((r) => r.post && r.post.author && sameContextAsAuthor(me, r.post.author));
  return { data: filtered };
}

async function acceptRequest(userId, requestId, body) {
  const { title, description, date } = body;
  const request = await WorkshopRequest.findById(requestId).populate("post");
  if (!request || !request.post) return { error: { status: 404, message: "Demande introuvable." } };
  const post = await Post.findById(request.post._id).populate("author", "campus class level");
  const me = await User.findById(userId).select("campus class level").populate("campus class level");
  if (!sameContextAsAuthor(me, post.author)) {
    return { error: { status: 403, message: "Vous ne pouvez accepter que les demandes de votre même campus/classe/niveau." } };
  }
  const workshop = await Workshop.create({
    title: (title || "").trim(),
    description: description?.trim() || "",
    date: date ? new Date(date) : undefined,
    createdBy: userId,
  });
  request.workshop = workshop._id;
  request.status = "accepted";
  await request.save();
  const studentId = request.user?.toString?.();
  if (studentId) {
    await Notification.create({
      recipient: studentId,
      actor: userId,
      type: "workchop_accepted",
      message: "Votre demande de workchop a été acceptée.",
      link: "/my-workshops",
    });
  }
  const populated = await WorkshopRequest.findById(request._id)
    .populate("workshop", "title description date")
    .populate("user", "name email");
  return { data: populated };
}

async function rejectRequest(userId, requestId) {
  const request = await WorkshopRequest.findById(requestId).populate("post");
  if (!request || !request.post) return { error: { status: 404, message: "Demande introuvable." } };
  const post = await Post.findById(request.post._id).populate("author", "campus class level");
  const me = await User.findById(userId).select("campus class level").populate("campus class level");
  if (!sameContextAsAuthor(me, post.author)) return { error: { status: 403, message: "Forbidden." } };
  request.status = "rejected";
  await request.save();
  const studentId = request.user?.toString?.();
  if (studentId) {
    await Notification.create({
      recipient: studentId,
      actor: userId,
      type: "workchop_rejected",
      message: "Votre demande de workchop a été refusée.",
      link: "/posts",
    });
  }
  return { data: request };
}

async function getMyWorkshops(userId) {
  const requests = await WorkshopRequest.find({
    user: userId,
    status: "accepted",
    workshop: { $ne: null },
  })
    .populate({ path: "workshop", select: "title description date createdBy", populate: { path: "createdBy", select: "name" } })
    .sort({ updatedAt: -1 });
  return { data: requests };
}

module.exports = {
  createWorkshop,
  getAllWorkshops,
  requestWorkshop,
  getMyRequests,
  requestFromPost,
  getPendingForFormateur,
  acceptRequest,
  rejectRequest,
  getMyWorkshops,
  sameContextAsAuthor,
};
