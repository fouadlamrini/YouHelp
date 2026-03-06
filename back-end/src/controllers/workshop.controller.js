const Workshop = require("../models/Workshop");
const WorkshopRequest = require("../models/WorkshopRequest");
const User = require("../models/User");
const Post = require("../models/Post");
const Engagement = require("../models/Engagement");

function sameContextAsAuthor(me, author) {
  if (!author || (!author.campus && !author.class && !author.level)) return false;
  const sameCampus = !!(me.campus && author.campus &&
    (me.campus._id?.toString() || me.campus.toString()) === (author.campus?._id?.toString() || author.campus?.toString()));
  const sameClass = !!(me.class && author.class &&
    (me.class._id?.toString() || me.class.toString()) === (author.class?._id?.toString() || author.class?.toString()));
  const sameLevel = !!(me.level && author.level &&
    (me.level._id?.toString() || me.level.toString()) === (author.level?._id?.toString() || author.level?.toString()));
  return sameCampus && sameClass && sameLevel;
}

class WorkshopController {
  async createWorkshop(req, res) {
    try {
      const { title, description, date } = req.body;
      if (!title?.trim()) return res.status(400).json({ message: "Title required" });
      const workshop = await Workshop.create({
        title: title.trim(),
        description: description?.trim(),
        date: date ? new Date(date) : undefined,
        createdBy: req.user.id,
      });
      res.status(201).json({ success: true, data: workshop });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getAllWorkshops(req, res) {
    try {
      const workshops = await Workshop.find()
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });
      res.json({ success: true, data: workshops });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async requestWorkshop(req, res) {
    try {
      const { workshopId } = req.params;
      const workshop = await Workshop.findById(workshopId);
      if (!workshop) return res.status(404).json({ message: "Workshop not found" });
      const existing = await WorkshopRequest.findOne({ user: req.user.id, workshop: workshopId });
      if (existing) {
        if (existing.status === "pending") {
          return res.status(400).json({ message: "You already have a pending request for this workshop" });
        }
        if (existing.status === "accepted") {
          return res.status(400).json({ message: "You are already accepted for this workshop" });
        }
      }
      const request = await WorkshopRequest.create({
        user: req.user.id,
        workshop: workshopId,
        status: "pending",
      });
      const populated = await WorkshopRequest.findById(request._id)
        .populate("user", "name email")
        .populate("workshop", "title date");
      res.status(201).json({ success: true, data: populated });
    } catch (err) {
      console.error(err);
      if (err.code === 11000) return res.status(400).json({ message: "Request already exists" });
      res.status(500).json({ message: "Server error" });
    }
  }

  async getMyRequests(req, res) {
    try {
      const requests = await WorkshopRequest.find({ user: req.user.id })
        .populate("workshop", "title description date")
        .sort({ createdAt: -1 });
      res.json({ success: true, data: requests });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async requestFromPost(req, res) {
    try {
      if (req.user.role !== "etudiant") {
        return res.status(403).json({ message: "Seuls les étudiants peuvent demander un workchop depuis un post." });
      }
      const { postId } = req.body;
      if (!postId) return res.status(400).json({ message: "postId required" });
      const post = await Post.findById(postId).populate("author", "campus class level");
      if (!post) return res.status(404).json({ message: "Post not found" });
      const author = post.author;
      const authorId = author?._id || author;
      const me = await User.findById(req.user.id).select("campus class level").populate("campus class level");
      if (!sameContextAsAuthor(me, author)) {
        return res.status(403).json({ message: "Vous devez avoir le même campus, classe et niveau que l'auteur du post." });
      }
      const totalSameContext = await User.countDocuments({
        campus: author?.campus?._id || author?.campus,
        class: author?.class?._id || author?.class,
        level: author?.level?._id || author?.level,
      });
      if (totalSameContext === 0) return res.status(400).json({ message: "Contexte invalide." });
      const sameContextReactionCount = await Engagement.countDocuments({
        type: "reaction",
        post: postId,
        user: { $in: await User.find({
          campus: author?.campus?._id || author?.campus,
          class: author?.class?._id || author?.class,
          level: author?.level?._id || author?.level,
        }).distinct("_id") },
      });
      if (sameContextReactionCount < totalSameContext * 0.5) {
        return res.status(400).json({ message: "La demande de workchop n'est possible que si au moins 50% des étudiants du même contexte ont réagi au post." });
      }
      const existing = await WorkshopRequest.findOne({ user: req.user.id, post: postId });
      if (existing) {
        if (existing.status === "pending") return res.status(400).json({ message: "Vous avez déjà une demande en attente pour ce post." });
        if (existing.status === "accepted") return res.status(400).json({ message: "Votre demande a déjà été acceptée." });
      }
      const request = await WorkshopRequest.create({ user: req.user.id, post: postId, status: "pending" });
      const populated = await WorkshopRequest.findById(request._id)
        .populate("user", "name email profilePicture")
        .populate("post", "content");
      res.status(201).json({ success: true, data: populated });
    } catch (err) {
      console.error(err);
      if (err.code === 11000) return res.status(400).json({ message: "Demande déjà existante." });
      res.status(500).json({ message: "Server error" });
    }
  }

  async getPendingForFormateur(req, res) {
    try {
      if (req.user.role !== "formateur") {
        return res.status(403).json({ message: "Réservé aux formateurs." });
      }
      const me = await User.findById(req.user.id).select("campus class level").populate("campus class level");
      const requests = await WorkshopRequest.find({
        post: { $ne: null },
        status: "pending",
      })
        .populate("user", "name email profilePicture")
        .populate({ path: "post", select: "content", populate: { path: "author", select: "name campus class level" } })
        .sort({ createdAt: -1 });
      const filtered = requests.filter((r) => r.post && r.post.author && sameContextAsAuthor(me, r.post.author));
      res.json({ success: true, data: filtered });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async acceptRequest(req, res) {
    try {
      if (req.user.role !== "formateur") {
        return res.status(403).json({ message: "Réservé aux formateurs." });
      }
      const { id } = req.params;
      const { title, description, date } = req.body;
      if (!title?.trim()) return res.status(400).json({ message: "Le titre du workchop est requis." });
      const request = await WorkshopRequest.findById(id).populate("post");
      if (!request || !request.post) return res.status(404).json({ message: "Demande introuvable." });
      const post = await Post.findById(request.post._id).populate("author", "campus class level");
      const me = await User.findById(req.user.id).select("campus class level").populate("campus class level");
      if (!sameContextAsAuthor(me, post.author)) {
        return res.status(403).json({ message: "Vous ne pouvez accepter que les demandes de votre même campus/classe/niveau." });
      }
      const workshop = await Workshop.create({
        title: title.trim(),
        description: description?.trim() || "",
        date: date ? new Date(date) : undefined,
        createdBy: req.user.id,
      });
      request.workshop = workshop._id;
      request.status = "accepted";
      await request.save();
      const populated = await WorkshopRequest.findById(request._id)
        .populate("workshop", "title description date")
        .populate("user", "name email");
      res.json({ success: true, data: populated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async rejectRequest(req, res) {
    try {
      if (req.user.role !== "formateur") return res.status(403).json({ message: "Réservé aux formateurs." });
      const request = await WorkshopRequest.findById(req.params.id).populate("post");
      if (!request || !request.post) return res.status(404).json({ message: "Demande introuvable." });
      const post = await Post.findById(request.post._id).populate("author", "campus class level");
      const me = await User.findById(req.user.id).select("campus class level").populate("campus class level");
      if (!sameContextAsAuthor(me, post.author)) return res.status(403).json({ message: "Forbidden." });
      request.status = "rejected";
      await request.save();
      res.json({ success: true, data: request });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getMyWorkshops(req, res) {
    try {
      const requests = await WorkshopRequest.find({
        user: req.user.id,
        status: "accepted",
        workshop: { $ne: null },
      })
        .populate({ path: "workshop", select: "title description date createdBy", populate: { path: "createdBy", select: "name" } })
        .sort({ updatedAt: -1 });
      res.json({ success: true, data: requests });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new WorkshopController();
