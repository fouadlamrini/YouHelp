const Knowledge = require("../models/Knowledge");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const User = require("../models/User");
const Engagement = require("../models/Engagement");
const Notification = require("../models/Notification");
const { areFriends, getMyFriendIds } = require("./friend.controller");

class KnowledgeController {
  // ===== CREATE =====
  // Créer une nouvelle connaissance
  // - Authentification requise
  // - Titre, contenu et catégorie obligatoires
  // - Médias, ressource et snippet optionnels
  async createKnowledge(req, res) {
    try {
      const currentUser = await User.findById(req.user.id)
        .select("status")
        .lean();
      if (!currentUser || currentUser.status !== "active") {
        return res
          .status(403)
          .json({
            message:
              "Seuls les comptes activés peuvent créer des connaissances.",
          });
      }

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

  // ===== READ =====
  // Récupérer toutes les connaissances
  // - Accessible à tous en lecture
  // - Retourne les connaissances avec les détails de l'auteur, catégorie, etc.
  async getAllKnowledge(req, res) {
    try {
      const rawFilter = (req.query.filter || "all").toString().toLowerCase();
      const allowedFilters = ["all", "friends", "my_campus"];
      const viewFilter = allowedFilters.includes(rawFilter) ? rawFilter : "all";

      const currentUser = await User.findById(req.user.id)
        .select("status campus class level role")
        .populate("campus class level")
        .populate("role", "name");
      if (!currentUser) {
        return res.status(403).json({ message: "Utilisateur introuvable" });
      }

      let authorFilter = {};
      let noAuthors = false;
      if (currentUser.status === "active") {
        const friendIds = await getMyFriendIds(req.user.id);

        if (viewFilter === "friends") {
          if (friendIds.length === 0) {
            noAuthors = true;
          } else {
            authorFilter = { author: { $in: friendIds } };
          }
        } else if (viewFilter === "my_campus") {
          const campusId = currentUser.campus?._id || currentUser.campus;
          if (campusId) {
            const sameCampusIds = await User.find({ campus: campusId }).distinct(
              "_id"
            );
            if (sameCampusIds.length === 0) {
              noAuthors = true;
            } else {
              authorFilter = { author: { $in: sameCampusIds } };
            }
          }
        }
      }

      if (noAuthors) {
        return res.json({ success: true, data: [] });
      }

      const knowledgeDocs = await Knowledge.find(authorFilter)
        .sort({ createdAt: -1 })
        .populate({ path: "author", select: "name email role profilePicture campus class level", populate: { path: "role", select: "name" } })
        .populate("category", "name")
        .populate("subCategory", "name")
        .populate("comments");

      const withMeta = await Promise.all(
        knowledgeDocs.map(async (k) => {
          const canReact = await this._knowledgeCanReact(
            req.user.id,
            currentUser,
            k,
            viewFilter
          );
          const canModerate = await this._canModerateKnowledge(req.user.id, currentUser, k);
          return { ...k.toObject(), canReact, canModerate };
        })
      );

      res.json({ success: true, data: withMeta });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  // Récupérer une connaissance par ID
  // - Accessible à tous en lecture
  async getKnowledgeById(req, res) {
    try {
      const { id } = req.params;

      const knowledge = await Knowledge.findById(id)
        .populate({ path: "author", select: "name email role profilePicture campus class level", populate: { path: "role", select: "name" } })
        .populate("category", "name")
        .populate("subCategory", "name")
        .populate("comments");

      if (!knowledge) {
        return res.status(404).json({ message: "Connaissance introuvable" });
      }

      const currentUser = await User.findById(req.user.id)
        .select("status campus class level role")
        .populate("campus class level")
        .populate("role", "name");
      if (!currentUser) {
        return res.status(403).json({ message: "Utilisateur introuvable" });
      }

      const canReact = await this._knowledgeCanReact(
        req.user.id,
        currentUser,
        knowledge,
        "all"
      );
      const canModerate = await this._canModerateKnowledge(req.user.id, currentUser, knowledge);

      res.json({ success: true, data: { ...knowledge.toObject(), canReact, canModerate } });
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
  // Supprimer une connaissance (autorisation gérée par checkKnowledgeOwnerOrAdmin)
  async deleteKnowledge(req, res) {
    try {
      const { id } = req.params;

      const knowledge = await Knowledge.findById(id);
      if (!knowledge) return res.status(404).json({ message: "Connaissance introuvable" });

      const authorId = (knowledge.author && knowledge.author.toString ? knowledge.author.toString() : knowledge.author?.toString?.()) || null;
      const deleterId = req.user.id.toString();
      if (authorId && authorId !== deleterId) {
        const actor = await User.findById(req.user.id).select("name").lean();
        const actorName = actor?.name || "Un responsable";
        const role = req.user.role;
        const message =
          role === "super_admin"
            ? "Le super admin a supprimé votre connaissance."
            : role === "admin"
              ? "L'administrateur a supprimé votre connaissance."
              : "Le formateur a supprimé votre connaissance.";
        await Notification.create({
          recipient: authorId,
          actor: req.user.id,
          type: "knowledge_deleted",
          message,
          link: "/knowledge",
        });
      }

      await Knowledge.findByIdAndDelete(id);

      res.json({ success: true, message: "Connaissance supprimée avec succès" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  // ===== REACTIONS =====
  // Ajouter/retirer une réaction (like) sur une connaissance
  // - Toggle: si l'utilisateur a déjà réagi, on retire la réaction, sinon on l'ajoute
  async toggleReaction(req, res) {
    try {
      const currentUser = await User.findById(req.user.id)
        .select("status campus class level role")
        .populate("campus class level")
        .populate("role", "name");
      if (!currentUser || currentUser.status !== "active") {
        return res
          .status(403)
          .json({
            message:
              "Seuls les comptes activés peuvent réagir aux connaissances.",
          });
      }

      const { id } = req.params;
      const knowledge = await Knowledge.findById(id).populate({
        path: "author",
        select: "campus class level role",
        populate: { path: "role", select: "name" },
      });
      if (!knowledge) return res.status(404).json({ message: "Connaissance introuvable" });
      const userId = req.user.id;
      const isAuthorSuperAdmin = knowledge.author?.role?.name === "super_admin";
      const isCurrentUserSuperAdmin = req.user.role === "super_admin";

      // Même règle que pour les posts : étudiant doit être même campus + classe + niveau OU ami (sauf super_admin ou auteur super_admin)
      if (!isCurrentUserSuperAdmin && !isAuthorSuperAdmin && (currentUser.role?.name === "etudiant" || req.user.role === "etudiant")) {
        const author = knowledge.author;
        const sameCampus =
          currentUser.campus &&
          author?.campus &&
          currentUser.campus._id.toString() === author.campus._id.toString();
        const sameClass =
          currentUser.class &&
          author?.class &&
          currentUser.class._id.toString() === author.class._id.toString();
        const sameLevel =
          currentUser.level &&
          author?.level &&
          currentUser.level._id.toString() === author.level._id.toString();
        const sameContext = sameCampus && sameClass && sameLevel;
        const friend = await areFriends(userId, author._id || author);
        if (!sameContext && !friend) {
          return res.status(403).json({
            message:
              "Vous ne pouvez réagir qu'aux connaissances de votre même campus/classe/niveau ou de vos amis.",
          });
        }
      }

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
  // Ajouter un partage sur une connaissance
  // - Chaque clic = un nouveau partage (pas de toggle)
  async toggleShare(req, res) {
    try {
      const currentUser = await User.findById(req.user.id)
        .select("status")
        .lean();
      if (!currentUser || currentUser.status !== "active") {
        return res
          .status(403)
          .json({
            message:
              "Seuls les comptes activés peuvent partager des connaissances.",
          });
      }

      const { id } = req.params;
      const knowledge = await Knowledge.findById(id);
      if (!knowledge) return res.status(404).json({ message: "Connaissance introuvable" });
      const userId = req.user.id;
      const authorId = (knowledge.author && knowledge.author.toString ? knowledge.author.toString() : knowledge.author?.toString?.()) || null;
      await Engagement.create({ type: "share", user: userId, knowledge: id });
      await Knowledge.findByIdAndUpdate(id, { $inc: { shareCount: 1 } });

      if (authorId && authorId !== userId.toString()) {
        const actor = await User.findById(userId).select("name").lean();
        const actorName = actor?.name || "Quelqu'un";
        await Notification.create({
          recipient: authorId,
          actor: userId,
          type: "knowledge_share",
          message: `${actorName} a partagé votre connaissance.`,
          link: `/knowledge?knowledge=${id}`,
        });
      }

      return res.json({ success: true, message: "Connaissance partagée", shareCount: (knowledge.shareCount || 0) + 1 });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  async _canModerateKnowledge(currentUserId, currentUser, knowledge) {
    if (!currentUserId || !currentUser) return false;
    const roleName = currentUser.role?.name ?? currentUser.role ?? null;
    if (roleName === "super_admin") return true;
    const authorId = knowledge.author?._id?.toString() || knowledge.author?.toString();
    if (authorId === currentUserId.toString()) return true;
    if (roleName !== "admin" && roleName !== "formateur") return false;
    const author = knowledge.author?.toObject ? knowledge.author : await User.findById(knowledge.author).populate("role", "name").populate("campus class level").lean();
    if (!author) return false;
    const authorRoleName = author?.role?.name ?? author?.role ?? null;
    const sameCampus =
      [currentUser.campus?._id ?? currentUser.campus, author.campus?._id ?? author.campus]
        .every(Boolean) &&
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

  async _knowledgeCanReact(currentUserId, currentUser, knowledge, viewFilter) {
    if (!currentUser || currentUser.status !== "active") return false;
    const author = knowledge.author;
    if (!author) return false;
    const authorId = author._id || author;
    if (currentUserId.toString() === authorId.toString()) return true;
    if (currentUser.role?.name === "super_admin") return true;
    if (author?.role?.name === "super_admin") return true;

    if (viewFilter === "friends") return true;

    const sameCampus =
      currentUser.campus &&
      author.campus &&
      currentUser.campus._id.toString() === author.campus._id.toString();
    const sameClass =
      currentUser.class &&
      author.class &&
      currentUser.class._id.toString() === author.class._id.toString();
    const sameLevel =
      currentUser.level &&
      author.level &&
      currentUser.level._id.toString() === author.level._id.toString();
    const sameContext = !!sameCampus && !!sameClass && !!sameLevel;

    if (viewFilter === "my_campus") {
      return sameContext;
    }

    const friend = await areFriends(currentUserId, authorId);
    return sameContext || friend;
  }
}

module.exports = new KnowledgeController();
