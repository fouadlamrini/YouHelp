const express = require("express");
const upload = require("../middlewares/upload.middleware");
const avatarController = require("../controllers/avatar.controller");

const router = express.Router();

// GET /api/avatars -> list of built-in avatar URLs
router.get("/", avatarController.getAvatars);

// POST /api/avatars/upload -> upload a custom avatar image
router.post("/upload", upload.single("avatar"), avatarController.uploadAvatar);

module.exports = router;
