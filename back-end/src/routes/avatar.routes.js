const express = require("express");
const upload = require("../middlewares/upload.middleware");
const avatarController = require("../controllers/avatar.controller");

const router = express.Router();

// POST /api/avatars/upload -> upload image from PC only
router.post("/upload", upload.single("avatar"), avatarController.uploadAvatar);

module.exports = router;
