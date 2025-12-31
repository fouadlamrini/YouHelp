const express = require("express");
const router = express.Router();
const KnowledgeController = require("../controllers/knowledge.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");

/* ===== READ ===== */
// Récupérer toutes les connaissances (accessible à tous, y compris "connected")
router.get("/", KnowledgeController.getAllKnowledge);

// Récupérer une connaissance par ID (accessible à tous, y compris "connected")
router.get("/:id", KnowledgeController.getKnowledgeById);

/* ===== CREATE ===== */
// Créer une nouvelle connaissance
// - Authentification requise
// - Rôles autorisés: admin, formateur, etudiant
// - Médias optionnels (max 10 fichiers)
router.post(
  "/",
  auth,
  requireRole(["admin", "formateur", "etudiant"]),
  upload.array("media", 10),
  KnowledgeController.createKnowledge
);

/* ===== UPDATE ===== */
// Mettre à jour une connaissance
// - Authentification requise
// - Seul l'auteur ou un admin peut mettre à jour
// - Médias optionnels
router.put(
  "/:id",
  auth,
  requireRole(["admin", "formateur", "etudiant"]),
  upload.array("media", 10),
  KnowledgeController.updateKnowledge
);

/* ===== DELETE ===== */
// Supprimer une connaissance
// - Authentification requise
// - Seul l'auteur ou un admin peut supprimer
router.delete(
  "/:id",
  auth,
  requireRole(["admin", "formateur", "etudiant"]),
  KnowledgeController.deleteKnowledge
);

/* ===== REACTIONS ===== */
// Ajouter/retirer une réaction (like) sur une connaissance
// - Authentification requise
// - Rôles autorisés: admin, formateur, etudiant (pas "connected")
router.post(
  "/:id/reaction",
  auth,
  requireRole(["admin", "formateur", "etudiant"]),
  KnowledgeController.toggleReaction
);

/* ===== SHARES ===== */
// Ajouter/retirer un partage sur une connaissance
// - Authentification requise
// - Rôles autorisés: admin, formateur, etudiant (pas "connected")
router.post(
  "/:id/share",
  auth,
  requireRole(["admin", "formateur", "etudiant"]),
  KnowledgeController.toggleShare
);

module.exports = router;
