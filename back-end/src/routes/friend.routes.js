const express = require("express");
const router = express.Router();
const { friendController } = require("../controllers/friend.controller");
const auth = require("../middlewares/auth.middleware");
const requireActive = require("../middlewares/requireActive.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate");
const { addFriendSchema } = require("../validators/friend.validator");

router.use(auth);
router.use(requireActive);
router.get("/", friendController.list);
router.post("/", requireRole(["super_admin", "admin", "formateur", "etudiant"]), validate(addFriendSchema), friendController.add);
router.delete("/:userId", friendController.remove);

module.exports = router;
