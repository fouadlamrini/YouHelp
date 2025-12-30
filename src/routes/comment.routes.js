const express = require("express");
const router = express.Router();
const CommentController = require("../controllers/comment.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");

// Récupérer tous les commentaires d'un post (lecture publique)
router.get("/post/:postId", CommentController.getCommentsByPost);

// Créer un commentaire (ou une réponse si body.parentComment fourni)
// Seuls admin/formateur/etudiant peuvent créer
router.post(
  "/post/:postId",
  auth,
  requireRole(["admin", "formateur", "etudiant"]),
  upload.array("media", 10),
  CommentController.createComment
);

// Liker / Unliker un commentaire (toggle)
router.post(
  "/:id/like",
  auth,
  requireRole(["admin", "formateur", "etudiant"]),
  CommentController.toggleLike
);

module.exports = router;
