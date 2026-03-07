const express = require("express");
const router = express.Router();
const controller = require("../controllers/campus.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate");
const { createCampusSchema, updateCampusSchema } = require("../validators/campus.validator");

// CRUD Campus - super_admin only for write; super_admin + admin can read (for user management)
router.get("/", auth, requireRole(["super_admin", "admin"]), controller.getAll);
router.get("/:id", auth, requireRole(["super_admin", "admin"]), controller.getById);
router.post("/", auth, requireRole(["super_admin"]), validate(createCampusSchema), controller.create);
router.put("/:id", auth, requireRole(["super_admin"]), validate(updateCampusSchema), controller.update);
router.delete("/:id", auth, requireRole(["super_admin"]), controller.delete);

module.exports = router;
