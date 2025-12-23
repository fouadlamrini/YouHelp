const express = require('express');
const router = express.Router();
const PostController = require('../controllers/post.controller');
const auth = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const checkOwnerOrAdmin = require("../middlewares/checkOwnerOrAdmin.middleware");
const upload = require('../middlewares/upload.middleware');

/* ===== READ ===== */
router.get("/", PostController.getAllPosts);


/* ===== CREATE (NO connected) ===== */
router.post(
  "/",
  auth,
  requireRole(["admin","formateur","etudiant"]),
  upload.array('media', 10), // permet d'ajouter 10 fichier
  PostController.createPost
);

/* ===== UPDATE (admin OR owner) ===== */
router.put(
  "/:id",
  auth,
  checkOwnerOrAdmin,
  PostController.updatePost
);

/* ===== DELETE (admin OR owner) ===== */
router.delete(
  "/:id",
  auth,
  checkOwnerOrAdmin,
  PostController.deletePost
);

module.exports = router;
