const express = require("express");
const router = express.Router();
const controller = require("../controllers/message.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");

router.post("/", auth, requireRole(["super_admin", "admin", "formateur", "etudiant"]), upload.single("attachment"), controller.send);
router.get("/conversations", auth, controller.getConversations);
router.get("/conversation/:userId", auth, controller.getConversation);
router.delete("/:id", auth, controller.deleteMessage);
router.post("/:id/reaction", auth, requireRole(["super_admin", "admin", "formateur", "etudiant"]), controller.toggleReaction);

module.exports = router;
