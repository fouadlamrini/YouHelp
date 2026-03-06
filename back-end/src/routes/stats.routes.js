const express = require("express");
const router = express.Router();
const controller = require("../controllers/stats.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

router.get("/", auth, requireRole(["super_admin", "admin", "formateur"]), controller.getStats.bind(controller));

module.exports = router;
