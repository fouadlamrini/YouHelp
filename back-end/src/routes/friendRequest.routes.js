const express = require("express");
const router = express.Router();
const controller = require("../controllers/friendRequest.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate");
const { sendFriendRequestSchema } = require("../validators/friendRequest.validator");

router.use(auth);

router.post("/", requireRole(["super_admin", "admin", "formateur", "etudiant"]), validate(sendFriendRequestSchema), controller.send);
router.get("/received", controller.listReceived);
router.get("/available-users", controller.availableUsers);
router.put("/:id/accept", controller.accept);
router.put("/:id/reject", controller.reject);

module.exports = router;
