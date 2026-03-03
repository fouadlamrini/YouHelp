const express = require("express");
const router = express.Router();
const controller = require("../controllers/campus.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

// CRUD Campus - super_admin only
router.get("/", auth, requireRole(["super_admin"]), controller.getAll);
router.get("/:id", auth, requireRole(["super_admin"]), controller.getById);
router.post("/", auth, requireRole(["super_admin"]), controller.create);
router.put("/:id", auth, requireRole(["super_admin"]), controller.update);
router.delete("/:id", auth, requireRole(["super_admin"]), controller.delete);

module.exports = router;
