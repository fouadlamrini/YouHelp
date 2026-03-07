const express = require("express");
const router = express.Router();
const PostController = require("../controllers/post.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const checkOwnerOrAdmin = require("../middlewares/checkOwnerOrAdmin.middleware");
const upload = require("../middlewares/upload.middleware");
const validate = require("../middlewares/validate");
const { createPostSchema, updatePostSchema } = require("../validators/post.validator");

/* ===== READ ===== (auth required for visibility filter; role null = campus filter read-only) */
router.get("/", auth, PostController.getAllPosts);
router.get("/shares/mine", auth, PostController.getMySharedPosts);
router.get("/:id", auth, PostController.getPostById);

/* ===== REACTION ===== */
router.post(
  "/:id/reaction",
  auth,
  requireRole(["admin", "formateur", "etudiant", "super_admin"]),
  PostController.toggleReaction
);

/* ===== SOLVED TOGGLE ===== */
router.patch("/:id/solved", auth, PostController.toggleSolved);

/* ===== PARTAGE ===== */
router.post("/:id/share", auth, PostController.toggleShare);
router.delete("/share/:shareId", auth, PostController.deleteShare);

/* ===== CREATE ===== */
router.post(
  "/",
  auth,
  requireRole(["admin", "formateur", "etudiant", "super_admin"]),
  upload.array("media", 10),
  validate(createPostSchema),
  PostController.createPost
);

/* ===== UPDATE ===== */
router.put(
  "/:id",
  auth,
  checkOwnerOrAdmin,
  upload.array("media", 10),
  validate(updatePostSchema),
  PostController.updatePost
);

/* ===== DELETE ===== */
router.delete("/:id", auth, checkOwnerOrAdmin, PostController.deletePost);

module.exports = router;
