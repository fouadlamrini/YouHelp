const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const { getAll } = require("../controllers/role.controller");

router.get("/", auth, requireRole(["super_admin", "admin", "formateur"]), getAll);

module.exports = router;
