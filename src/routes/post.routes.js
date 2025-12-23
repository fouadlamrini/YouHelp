const express = require('express');
const router = express.Router();
const PostController = require('../controllers/Post.controller');
const auth = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const checkOwnerOrAdmin = require("../middlewares/checkOwnerOrAdmin.middleware");
const upload = require("../middlewares/upload.middleware");

/* ===== READ ===== */
router.get("/", PostController.getAllPosts);
router.get("/:id", PostController.getPostById);

/* ===== CREATE ===== */
router.post(
  "/",
  auth,
  requireRole(["admin", "formateur", "etudiant"]),
  upload.array('media', 10),
  PostController.createPost
);

/* ===== UPDATE ===== */
router.put(
  "/:id",
  auth,
  checkOwnerOrAdmin,
  upload.array('media', 10),
  PostController.updatePost
);

/* ===== DELETE ===== */
router.delete(
  "/:id",
  auth,
  checkOwnerOrAdmin,
  PostController.deletePost
);

module.exports = router;
