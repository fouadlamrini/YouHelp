const express = require("express");
const router = express.Router();
const { friendController } = require("../controllers/friend.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

router.use(auth);
router.get("/", friendController.list);
router.post("/", requireRole(["super_admin", "admin", "formateur", "etudiant"]), friendController.add);
router.delete("/:userId", friendController.remove);

module.exports = router;
