const express = require("express");
const router = express.Router();
const PostController = require("../controllers/post.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const requireActive = require("../middlewares/requireActive.middleware");
const checkOwnerOrAdmin = require("../middlewares/checkOwnerOrAdmin.middleware");
const upload = require("../middlewares/upload.middleware");

/* ===== READ ===== */
router.get("/", auth, PostController.getAllPosts.bind(PostController));
router.get("/shares/mine", auth, PostController.getMySharedPosts.bind(PostController));
router.get("/:id", auth, PostController.getPostById.bind(PostController));

/* ===== REACTION ===== (actif uniquement) */
router.post(
  "/:id/reaction",
  auth,
  requireActive,
  requireRole(["admin", "formateur", "etudiant", "super_admin"]),
  PostController.toggleReaction.bind(PostController)
);

/* ===== SOLVED TOGGLE ===== */
router.patch("/:id/solved", auth, requireActive, PostController.toggleSolved.bind(PostController));

/* ===== PARTAGE ===== */
router.post("/:id/share", auth, requireActive, PostController.toggleShare.bind(PostController));
router.delete("/share/:shareId", auth, requireActive, PostController.deleteShare.bind(PostController));

/* ===== CREATE ===== */
router.post(
  "/",
  auth,
  requireActive,
  requireRole(["admin", "formateur", "etudiant", "super_admin"]),
  upload.array("media", 10),
  PostController.createPost.bind(PostController)
);

/* ===== UPDATE ===== */
router.put(
  "/:id",
  auth,
  requireActive,
  checkOwnerOrAdmin,
  upload.array("media", 10),
  PostController.updatePost.bind(PostController)
);

/* ===== DELETE ===== */
router.delete("/:id", auth, requireActive, checkOwnerOrAdmin, PostController.deletePost.bind(PostController));

module.exports = router;
