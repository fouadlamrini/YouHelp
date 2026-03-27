const express = require("express");
const router = express.Router();
const controller = require("../controllers/message.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");
const validate = require("../middlewares/validate");
const { sendMessageSchema } = require("../validators/message.validator");

router.post("/", auth, requireRole(["super_admin", "admin", "formateur", "etudiant"]), upload.single("attachment"), validate(sendMessageSchema), controller.send);
router.get("/conversations", auth, controller.getConversations);
router.get("/conversation/:userId", auth, controller.getConversation);
router.delete("/:id", auth, controller.deleteMessage);

module.exports = router;
