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

// Mettre à jour un commentaire ou une réponse — auth seulement; controller vérifie owner/post-owner/admin
router.put(
  "/:id",
  auth,
  upload.array("media", 10),
  CommentController.updateComment
);

// Supprimer un commentaire ou une réponse — auth seulement; controller vérifie owner/post-owner/admin
router.delete("/:id", auth, CommentController.deleteComment);

module.exports = router;
