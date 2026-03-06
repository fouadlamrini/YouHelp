const express = require("express");
const router = express.Router();
const controller = require("../controllers/level.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

// CRUD Level - super_admin only for write; super_admin + admin can read (for user creation)
router.get("/", auth, requireRole(["super_admin", "admin"]), controller.getAll);
router.get("/:id", auth, requireRole(["super_admin", "admin"]), controller.getById);
router.post("/", auth, requireRole(["super_admin"]), controller.create);
router.put("/:id", auth, requireRole(["super_admin"]), controller.update);
router.delete("/:id", auth, requireRole(["super_admin"]), controller.delete);

module.exports = router;
