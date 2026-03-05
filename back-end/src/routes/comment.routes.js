const express = require("express");
const router = express.Router();
const CommentController = require("../controllers/comment.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const requireActive = require("../middlewares/requireActive.middleware");
const upload = require("../middlewares/upload.middleware");

// Récupérer tous les commentaires d'un post (lecture publique)
router.get("/post/:postId", CommentController.getCommentsByPost);

// Créer un commentaire (ou une réponse si body.parentComment fourni)
router.post(
  "/post/:postId",
  auth,
  requireActive,
  requireRole(["admin", "formateur", "etudiant", "super_admin"]),
  upload.array("media", 10),
  CommentController.createComment
);

// Liker / Unliker un commentaire (toggle)
router.post(
  "/:id/like",
  auth,
  requireActive,
  requireRole(["admin", "formateur", "etudiant", "super_admin"]),
  CommentController.toggleLike
);

router.put(
  "/:id",
  auth,
  requireActive,
  upload.array("media", 10),
  CommentController.updateComment
);

router.delete("/:id", auth, requireActive, CommentController.deleteComment);

module.exports = router;
