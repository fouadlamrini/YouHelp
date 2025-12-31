const Knowledge = require("../models/Knowledge");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const User = require("../models/User");

class KnowledgeController {
  // ===== CREATE =====
  // Créer une nouvelle connaissance
  // - Authentification requise
  // - Titre, contenu et catégorie obligatoires
  // - Médias, ressource et snippet optionnels
  async createKnowledge(req, res) {
    try {
      const { title, content, category, subCategory, tags, resource, snippet } = req.body;

      // Vérifier que le titre et le contenu sont fournis
      if (!title || title.trim() === "") {
        return res.status(400).json({ message: "Le titre est obligatoire" });
      }
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

      // Traiter les tags (extraire les hashtags)
      let tagsArray = [];
      if (tags) {
        tagsArray = tags
          .split(" ")
          .filter((tag) => tag.startsWith("#"))
          .map((tag) => tag.slice(1).trim())
          .filter((tag) => tag.length > 0);
      }

      // Traiter les médias uploadés
      const mediaFiles = req.files ? req.files.map((file) => {
        let type = "file";
        if (file.mimetype.startsWith("image")) type = "image";
        else if (file.mimetype.startsWith("video")) type = "video";
        else if (file.mimetype === "application/pdf") type = "pdf";
        else if (file.mimetype.includes("word")) type = "doc";
        return { url: `/uploads/${file.filename}`, type };
      }) : [];

      // Créer la connaissance
      const knowledge = await Knowledge.create({
        title,
        content,
        author: req.user.id,
        category: categoryDoc._id,
        subCategory: subCategoryId,
        tags: tagsArray,
        media: mediaFiles,
        resource: resource || null,
        snippet: snippet ? {
          code: snippet.code || "",
          language: snippet.language || "javascript",
        } : null,
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
  // - Accessible à tous (y compris les utilisateurs "connected" en lecture seule)
  // - Retourne les connaissances avec les détails de l'auteur, catégorie, etc.
  async getAllKnowledge(req, res) {
    try {
      const knowledge = await Knowledge.find()
        .sort({ createdAt: -1 })
        .populate("author", "name email role")
        .populate("category", "name")
        .populate("subCategory", "name")
        .populate("comments")
        .populate("reactions", "name email")
        .populate("shares", "name email");

      res.json({ success: true, data: knowledge });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  // Récupérer une connaissance par ID
  // - Accessible à tous (y compris les utilisateurs "connected" en lecture seule)
  async getKnowledgeById(req, res) {
    try {
      const { id } = req.params;

      const knowledge = await Knowledge.findById(id)
        .populate("author", "name email role")
        .populate("category", "name")
        .populate("subCategory", "name")
        .populate("comments")
        .populate("reactions", "name email")
        .populate("shares", "name email");

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
  // - Peut modifier: titre, contenu, catégorie, sous-catégorie, tags, ressource, snippet
  async updateKnowledge(req, res) {
    try {
      const { id } = req.params;
      const { category, subCategory, tags, resource, snippet, ...rest } = req.body;

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

      // Mettre à jour les tags si fournis
      if (tags) {
        updateData.tags = tags
          .split(" ")
          .filter((tag) => tag.startsWith("#"))
          .map((tag) => tag.slice(1).trim())
          .filter((tag) => tag.length > 0);
      }

      // Mettre à jour la ressource si fournie
      if (resource) {
        updateData.resource = resource;
      }

      // Mettre à jour le snippet si fourni
      if (snippet) {
        updateData.snippet = {
          code: snippet.code || "",
          language: snippet.language || "javascript",
        };
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
  // - Seuls les utilisateurs authentifiés (sauf "connected") peuvent réagir
  // - Toggle: si l'utilisateur a déjà réagi, on retire la réaction, sinon on l'ajoute
  async toggleReaction(req, res) {
    try {
      const { id } = req.params;

      // Vérifier que l'utilisateur n'est pas "connected"
      if (req.user?.role === "connected") {
        return res.status(403).json({
          message: "Accès refusé: demander le rôle approprié pour réagir",
        });
      }

      // Vérifier que la connaissance existe
      const knowledge = await Knowledge.findById(id);
      if (!knowledge) {
        return res.status(404).json({ message: "Connaissance introuvable" });
      }

      const userId = req.user.id;
      const hasReacted = knowledge.reactions.includes(userId);

      if (hasReacted) {
        // Retirer la réaction
        knowledge.reactions = knowledge.reactions.filter(
          (u) => u.toString() !== userId
        );
        knowledge.reactionCount = Math.max(0, knowledge.reactionCount - 1);
      } else {
        // Ajouter la réaction
        knowledge.reactions.push(userId);
        knowledge.reactionCount += 1;
      }

      await knowledge.save();

      res.json({
        success: true,
        message: hasReacted ? "Réaction retirée" : "Réaction ajoutée",
        reactionCount: knowledge.reactionCount,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  // ===== SHARES =====
  // Ajouter/retirer un partage sur une connaissance
  // - Seuls les utilisateurs authentifiés (sauf "connected") peuvent partager
  // - Toggle: si l'utilisateur a déjà partagé, on retire le partage, sinon on l'ajoute
  async toggleShare(req, res) {
    try {
      const { id } = req.params;

      // Vérifier que l'utilisateur n'est pas "connected"
      if (req.user?.role === "connected") {
        return res.status(403).json({
          message: "Accès refusé: demander le rôle approprié pour partager",
        });
      }

      // Vérifier que la connaissance existe
      const knowledge = await Knowledge.findById(id);
      if (!knowledge) {
        return res.status(404).json({ message: "Connaissance introuvable" });
      }

      // Empêcher de partager sa propre connaissance
      if (knowledge.author.toString() === req.user.id) {
        return res.status(400).json({
          message: "Vous ne pouvez pas partager votre propre connaissance",
        });
      }

      const userId = req.user.id;
      const hasShared = knowledge.shares.includes(userId);

      if (hasShared) {
        // Retirer le partage
        knowledge.shares = knowledge.shares.filter(
          (u) => u.toString() !== userId
        );
        knowledge.shareCount = Math.max(0, knowledge.shareCount - 1);
      } else {
        // Ajouter le partage
        knowledge.shares.push(userId);
        knowledge.shareCount += 1;
      }

      await knowledge.save();

      res.json({
        success: true,
        message: hasShared ? "Partage retiré" : "Connaissance partagée",
        shareCount: knowledge.shareCount,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
}

module.exports = new KnowledgeController();
