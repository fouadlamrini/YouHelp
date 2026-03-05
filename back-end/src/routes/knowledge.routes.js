const express = require("express");
const router = express.Router();
const KnowledgeController = require("../controllers/knowledge.controller");
const CommentController = require("../controllers/comment.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const requireActive = require("../middlewares/requireActive.middleware");
const upload = require("../middlewares/upload.middleware");

/* ===== READ ===== */
router.get("/", auth, KnowledgeController.getAllKnowledge);

router.get("/:knowledgeId/comments", CommentController.getCommentsByKnowledge);
router.post(
  "/:knowledgeId/comments",
  auth,
  requireActive,
  requireRole(["admin", "formateur", "etudiant", "super_admin"]),
  upload.array("media", 10),
  CommentController.createCommentForKnowledge
);

router.get("/:id", auth, KnowledgeController.getKnowledgeById);

/* ===== CREATE ===== */
router.post(
  "/",
  auth,
  requireActive,
  requireRole(["admin", "formateur", "etudiant", "super_admin"]),
  upload.array("media", 10),
  KnowledgeController.createKnowledge
);

/* ===== UPDATE ===== */
router.put(
  "/:id",
  auth,
  requireActive,
  requireRole(["admin", "formateur", "etudiant", "super_admin"]),
  upload.array("media", 10),
  KnowledgeController.updateKnowledge
);

/* ===== DELETE ===== */
router.delete(
  "/:id",
  auth,
  requireActive,
  requireRole(["admin", "formateur", "etudiant", "super_admin"]),
  KnowledgeController.deleteKnowledge
);

/* ===== REACTIONS ===== */
router.post(
  "/:id/reaction",
  auth,
  requireActive,
  requireRole(["admin", "formateur", "etudiant", "super_admin"]),
  KnowledgeController.toggleReaction
);

/* ===== SHARES ===== */
router.post(
  "/:id/share",
  auth,
  requireActive,
  requireRole(["admin", "formateur", "etudiant", "super_admin"]),
  KnowledgeController.toggleShare
);

module.exports = router;
