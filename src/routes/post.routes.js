const express = require("express");
const router = express.Router();
const PostController = require("../controllers/post.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/", PostController.getAllPosts);

router.post("/", auth, PostController.createPost);
router.put("/:id", auth, PostController.updatePost);
router.delete("/:id", auth, PostController.deletePost);

module.exports = router;
