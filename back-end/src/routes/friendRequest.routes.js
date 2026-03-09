const express = require("express");
const router = express.Router();
const controller = require("../controllers/friendRequest.controller");
const auth = require("../middlewares/auth.middleware");
const requireActive = require("../middlewares/requireActive.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate");
const { sendFriendRequestSchema } = require("../validators/friendRequest.validator");

router.use(auth);
router.use(requireActive);

router.post("/", requireRole(["super_admin", "admin", "formateur", "etudiant"]), validate(sendFriendRequestSchema), controller.send);
router.get("/received", controller.listReceived);
router.get("/sent", controller.listSent);
router.get("/available-users", controller.availableUsers);
router.put("/:id/accept", controller.accept);
router.put("/:id/reject", controller.reject);
router.delete("/:id/cancel", controller.cancelSent);

module.exports = router;
