const Knowledge = require("../models/Knowledge");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const User = require("../models/User");
const Engagement = require("../models/Engagement");
const Friend = require("../models/Friend");
const { areFriends } = require("./friend.controller");

class KnowledgeController {
  // ===== CREATE =====
  // Créer une nouvelle connaissance
  // - Authentification requise
  // - Titre, contenu et catégorie obligatoires
  // - Médias, ressource et snippet optionnels
  async createKnowledge(req, res) {
    try {
      const { content, category, subCategory } = req.body;

      if (!content || content.trim() === "") {
        return res.status(400).json({ message: "Le contenu est obligatoire" });
      }

      // Vérifier que la catégorie existe
      const categoryDoc = await Category.findOne({ name: category });
      if (!categoryDoc) {
        return res.status(400).json({ message: "Catégorie introuvable" });
      }

      // Vérifier que la sous-catégorie existe (si fournie)
      let subCategoryId = null;
      if (subCategory) {
        const subCategoryDoc = await SubCategory.findOne({
          name: subCategory,
          category: categoryDoc._id,
        });
        if (!subCategoryDoc) {
          return res.status(400).json({ message: "Sous-catégorie introuvable" });
        }
        subCategoryId = subCategoryDoc._id;
      }

      // Traiter les médias uploadés (même logique que Post)
      const mediaFiles = (req.files || []).map((file) => {
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

      // Créer la connaissance
      const knowledge = await Knowledge.create({
        content,
        author: req.user.id,
        category: categoryDoc._id,
        subCategory: subCategoryId,
        media: mediaFiles,
      });

      res.status(201).json({
        success: true,
        message: "Connaissance créée avec succès",
        data: knowledge,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  // Filtre auteur selon type (all | friends | my_campus) et statut utilisateur
  async _knowledgeAuthorFilterByFilter(req, filterType) {
    if (!req.user) return { _id: -1 };
    const current = await User.findById(req.user.id)
      .select("status campus")
      .populate("campus");
    if (!current) return { _id: -1 };
    if (current.status !== "active") return {};
    const filter = (filterType || "all").toLowerCase();
    if (filter === "all") return {};
    if (filter === "friends") {
      const friendDocs = await Friend.find({
        $or: [{ user1: req.user.id }, { user2: req.user.id }],
      }).select("user1 user2");
      const myFriendIds = friendDocs.map((d) => {
        const u1 = d.user1.toString();
        const u2 = d.user2.toString();
        return u1 === req.user.id ? u2 : u1;
      });
      return { author: { $in: myFriendIds } };
    }
    if (filter === "my_campus") {
      if (!current.campus) return { author: { $in: [] } };
      const authorIds = await User.find({ campus: current.campus._id }).distinct("_id");
      return { author: { $in: authorIds } };
    }
    return {};
  }

  async _canReactToKnowledge(req, authorId) {
    if (!req.user || !authorId) return false;
    const me = await User.findById(req.user.id).select("status").populate("campus class level");
    if (!me || me.status !== "active") return false;
    const role = req.user.role;
    if (role === "super_admin" || role === "admin") return true;
    const author = await User.findById(authorId).populate("campus class level");
    if (!author) return false;
    const sameCampus = me.campus && author.campus && me.campus._id.toString() === author.campus._id.toString();
    const sameClass = me.class && author.class && me.class._id.toString() === author.class._id.toString();
    const sameLevel = me.level && author.level && me.level._id.toString() === author.level._id.toString();
    if (sameCampus && sameClass && sameLevel) return true;
    return !!(await areFriends(req.user.id, authorId));
  }

  // ===== READ =====
  async getAllKnowledge(req, res) {
    try {
      const filterType = req.query.filter || "all";
      const authorFilter = await this._knowledgeAuthorFilterByFilter(req, filterType);
      if (authorFilter._id === -1) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const knowledge = await Knowledge.find(authorFilter)
        .sort({ createdAt: -1 })
        .populate("author", "name email campus class level profilePicture")
        .populate("category", "name")
        .populate("subCategory", "name")
        .populate("comments");
      const withCanReact = await Promise.all(
        knowledge.map(async (k) => {
          const authorId = k.author?._id || k.author;
          const canReact = await this._canReactToKnowledge(req, authorId);
          return { ...k.toObject(), canReact };
        })
      );
      res.json({ success: true, data: withCanReact });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  async getKnowledgeById(req, res) {
    try {
      const { id } = req.params;
      const knowledge = await Knowledge.findById(id)
        .populate("author", "name email campus class level profilePicture")
        .populate("category", "name")
        .populate("subCategory", "name")
        .populate("comments");
      if (!knowledge) {
        return res.status(404).json({ message: "Connaissance introuvable" });
      }
      const authorId = knowledge.author?._id || knowledge.author;
      const canReact = await this._canReactToKnowledge(req, authorId);
      res.json({ success: true, data: { ...knowledge.toObject(), canReact } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  // ===== UPDATE =====
  // Mettre à jour une connaissance
  // - Seul l'auteur ou un admin peut mettre à jour
  // - Peut modifier: contenu, catégorie, sous-catégorie, médias
  async updateKnowledge(req, res) {
    try {
      const { id } = req.params;
      const { category, subCategory, ...rest } = req.body;

      // Vérifier que la connaissance existe
      const knowledge = await Knowledge.findById(id);
      if (!knowledge) {
        return res.status(404).json({ message: "Connaissance introuvable" });
      }

      // Vérifier que l'utilisateur est l'auteur ou un admin
      const user = await User.findById(req.user.id);
      const isOwner = knowledge.author.toString() === req.user.id;
      const isAdmin = user.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          message: "Seul l'auteur ou un admin peut mettre à jour cette connaissance",
        });
      }

      let updateData = { ...rest };

      // Mettre à jour la catégorie si fournie
      if (category) {
        const categoryDoc = await Category.findOne({ name: category });
        if (!categoryDoc) {
          return res.status(400).json({ message: "Catégorie introuvable" });
        }
        updateData.category = categoryDoc._id;

        // Mettre à jour la sous-catégorie si fournie
        if (subCategory) {
          const subCategoryDoc = await SubCategory.findOne({
            name: subCategory,
            category: categoryDoc._id,
          });
          if (!subCategoryDoc) {
            return res.status(400).json({ message: "Sous-catégorie introuvable" });
          }
          updateData.subCategory = subCategoryDoc._id;
        }
      }

     

      // Gérer les médias existants / nouveaux (même logique que Post)
      try {
        const existingMediaRaw = req.body.existingMedia;
        let existingMedia = [];
        if (existingMediaRaw) {
          if (Array.isArray(existingMediaRaw)) {
            existingMedia = existingMediaRaw;
          } else if (typeof existingMediaRaw === "string") {
            existingMedia = JSON.parse(existingMediaRaw || "[]");
          }
        }

        const uploadedMedia = (req.files || []).map((file) => {
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

        if (existingMedia.length || uploadedMedia.length) {
          updateData.media = [...existingMedia, ...uploadedMedia];
        }
      } catch (e) {
        console.error("Error parsing existingMedia for knowledge update:", e);
      }

      // Mettre à jour la connaissance
      const updatedKnowledge = await Knowledge.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      res.json({
        success: true,
        message: "Connaissance mise à jour avec succès",
        data: updatedKnowledge,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  // ===== DELETE =====
  // Supprimer une connaissance
  // - Seul l'auteur ou un admin peut supprimer
  async deleteKnowledge(req, res) {
    try {
      const { id } = req.params;

      // Vérifier que la connaissance existe
      const knowledge = await Knowledge.findById(id);
      if (!knowledge) {
        return res.status(404).json({ message: "Connaissance introuvable" });
      }

      // Vérifier que l'utilisateur est l'auteur ou un admin
      const user = await User.findById(req.user.id);
      const isOwner = knowledge.author.toString() === req.user.id;
      const isAdmin = user.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          message: "Seul l'auteur ou un admin peut supprimer cette connaissance",
        });
      }

      // Supprimer la connaissance
      await Knowledge.findByIdAndDelete(id);

      res.json({
        success: true,
        message: "Connaissance supprimée avec succès",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  // ===== REACTIONS =====
  async toggleReaction(req, res) {
    try {
      const { id } = req.params;
      const knowledge = await Knowledge.findById(id).populate("author");
      if (!knowledge) return res.status(404).json({ message: "Connaissance introuvable" });
      const authorId = knowledge.author?._id || knowledge.author;
      const canReact = await this._canReactToKnowledge(req, authorId);
      if (!canReact) {
        return res.status(403).json({
          message: "Vous ne pouvez réagir qu'aux contenus du même campus/classe/niveau ou de vos amis",
        });
      }
      const userId = req.user.id;
      const existing = await Engagement.findOne({ type: "reaction", user: userId, knowledge: id });
      if (existing) {
        await Engagement.deleteOne({ _id: existing._id });
        await Knowledge.findByIdAndUpdate(id, { $inc: { reactionCount: -1 } });
        return res.json({
          success: true,
          message: "Réaction retirée",
          reactionCount: Math.max(0, (knowledge.reactionCount || 0) - 1),
        });
      }
      await Engagement.create({ type: "reaction", user: userId, knowledge: id });
      await Knowledge.findByIdAndUpdate(id, { $inc: { reactionCount: 1 } });
      return res.json({
        success: true,
        message: "Réaction ajoutée",
        reactionCount: (knowledge.reactionCount || 0) + 1,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  // ===== SHARES =====
  async toggleShare(req, res) {
    try {
      const { id } = req.params;
      const knowledge = await Knowledge.findById(id).populate("author");
      if (!knowledge) return res.status(404).json({ message: "Connaissance introuvable" });
      const authorId = knowledge.author?._id || knowledge.author;
      const canReact = await this._canReactToKnowledge(req, authorId);
      if (!canReact) {
        return res.status(403).json({
          message: "Vous ne pouvez partager que les contenus du même campus/classe/niveau ou de vos amis",
        });
      }
      const userId = req.user.id;
      await Engagement.create({ type: "share", user: userId, knowledge: id });
      await Knowledge.findByIdAndUpdate(id, { $inc: { shareCount: 1 } });
      return res.json({ success: true, message: "Connaissance partagée", shareCount: (knowledge.shareCount || 0) + 1 });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
}

module.exports = new KnowledgeController();
