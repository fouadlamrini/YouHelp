const express = require("express");
const router = express.Router();
const KnowledgeController = require("../controllers/knowledge.controller");
const CommentController = require("../controllers/comment.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");

/* ===== READ ===== */
// Récupérer toutes les connaissances (lecture avec filtrage par utilisateur connecté)
router.get("/", auth, KnowledgeController.getAllKnowledge.bind(KnowledgeController));

// Commentaires sur une connaissance (avant /:id pour que :id ne capture pas "comments")
router.get("/:knowledgeId/comments", CommentController.getCommentsByKnowledge);
router.post(
  "/:knowledgeId/comments",
  auth,
  requireRole(["admin", "formateur", "etudiant", "super_admin"]),
  upload.array("media", 10),
  CommentController.createCommentForKnowledge
);

// Récupérer une connaissance par ID (lecture avec meta pour utilisateur connecté)
router.get("/:id", auth, KnowledgeController.getKnowledgeById.bind(KnowledgeController));

/* ===== CREATE ===== */
// Créer une nouvelle connaissance
// - Authentification requise
// - Rôles autorisés: admin, formateur, etudiant, super_admin
// - Médias optionnels (max 10 fichiers)
router.post(
  "/",
  auth,
  requireRole(["admin", "formateur", "etudiant", "super_admin"]),
  upload.array("media", 10),
  KnowledgeController.createKnowledge.bind(KnowledgeController)
);

/* ===== UPDATE ===== */
// Mettre à jour une connaissance
// - Authentification requise
// - Seul l'auteur ou un admin/super_admin peut mettre à jour
// - Médias optionnels
router.put(
  "/:id",
  auth,
  requireRole(["admin", "formateur", "etudiant", "super_admin"]),
  upload.array("media", 10),
  KnowledgeController.updateKnowledge.bind(KnowledgeController)
);

/* ===== DELETE ===== */
// Supprimer une connaissance
// - Authentification requise
// - Seul l'auteur ou un admin/super_admin peut supprimer
router.delete(
  "/:id",
  auth,
  requireRole(["admin", "formateur", "etudiant", "super_admin"]),
  KnowledgeController.deleteKnowledge.bind(KnowledgeController)
);

/* ===== REACTIONS ===== */
// Ajouter/retirer une réaction (like) sur une connaissance
// - Authentification requise
// - Rôles autorisés: admin, formateur, etudiant, super_admin
router.post(
  "/:id/reaction",
  auth,
  requireRole(["admin", "formateur", "etudiant", "super_admin"]),
  KnowledgeController.toggleReaction.bind(KnowledgeController)
);

/* ===== SHARES ===== */
// Ajouter/retirer un partage sur une connaissance
// - Authentification requise
// - Rôles autorisés: admin, formateur, etudiant, super_admin
router.post(
  "/:id/share",
  auth,
  requireRole(["admin", "formateur", "etudiant", "super_admin"]),
  KnowledgeController.toggleShare.bind(KnowledgeController)
);

module.exports = router;
