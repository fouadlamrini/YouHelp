const express = require("express");
const router = express.Router();
const controller = require("../controllers/callHistory.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

router.get(
  "/history",
  auth,
  requireRole(["super_admin", "admin", "formateur", "etudiant"]),
  controller.getMine
);

module.exports = router;
