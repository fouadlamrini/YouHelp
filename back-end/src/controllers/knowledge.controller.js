const Knowledge = require("../models/Knowledge");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const User = require("../models/User");
const Engagement = require("../models/Engagement");

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

  // ===== READ =====
  // Récupérer toutes les connaissances
  // - Accessible à tous (y compris utilisateurs sans role en lecture seule)
  // - Retourne les connaissances avec les détails de l'auteur, catégorie, etc.
  async getAllKnowledge(req, res) {
    try {
      const knowledge = await Knowledge.find()
        .sort({ createdAt: -1 })
        .populate("author", "name email role")
        .populate("category", "name")
        .populate("subCategory", "name")
        .populate("comments");

      res.json({ success: true, data: knowledge });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  // Récupérer une connaissance par ID
  // - Accessible à tous (y compris utilisateurs sans role en lecture seule)
  async getKnowledgeById(req, res) {
    try {
      const { id } = req.params;

      const knowledge = await Knowledge.findById(id)
        .populate("author", "name email role")
        .populate("category", "name")
        .populate("subCategory", "name")
        .populate("comments");

      if (!knowledge) {
        return res.status(404).json({ message: "Connaissance introuvable" });
      }

      res.json({ success: true, data: knowledge });
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
  // Ajouter/retirer une réaction (like) sur une connaissance
  // - Seuls les utilisateurs avec role peuvent réagir
  // - Toggle: si l'utilisateur a déjà réagi, on retire la réaction, sinon on l'ajoute
  async toggleReaction(req, res) {
    try {
      const { id } = req.params;
      if (req.user?.role == null) {
        return res.status(403).json({
          message: "Accès refusé: demander le rôle approprié pour réagir",
        });
      }
      const knowledge = await Knowledge.findById(id);
      if (!knowledge) return res.status(404).json({ message: "Connaissance introuvable" });
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
  // Ajouter/retirer un partage sur une connaissance
  // - Seuls les utilisateurs avec role peuvent partager
  // - Toggle: si l'utilisateur a déjà partagé, on retire le partage, sinon on l'ajoute
  async toggleShare(req, res) {
    try {
      const { id } = req.params;
      if (req.user?.role == null) {
        return res.status(403).json({
          message: "Accès refusé: demander le rôle approprié pour partager",
        });
      }
      const knowledge = await Knowledge.findById(id);
      if (!knowledge) return res.status(404).json({ message: "Connaissance introuvable" });
      if (knowledge.author.toString() === req.user.id) {
        return res.status(400).json({
          message: "Vous ne pouvez pas partager votre propre connaissance",
        });
      }
      const userId = req.user.id;
      const existing = await Engagement.findOne({ type: "share", user: userId, knowledge: id });
      if (existing) {
        await Engagement.deleteOne({ _id: existing._id });
        await Knowledge.findByIdAndUpdate(id, { $inc: { shareCount: -1 } });
        return res.json({ success: true, message: "Partage retiré", shareCount: Math.max(0, (knowledge.shareCount || 0) - 1) });
      }
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
