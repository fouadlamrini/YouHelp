const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

// Profile (current user)
router.get("/me", auth, controller.getMe);
router.put("/me", auth, controller.updateProfile);

// CRUD User - super_admin: all; admin: same campus; formateur: same class (etudiants)
router.get(
  "/",
  auth,
  requireRole(["super_admin", "admin", "formateur"]),
  controller.getAll
);
router.get(
  "/:id",
  auth,
  requireRole(["super_admin", "admin", "formateur"]),
  controller.getById
);
router.post(
  "/",
  auth,
  requireRole(["super_admin", "admin", "formateur"]),
  controller.create
);
router.put(
  "/:id",
  auth,
  requireRole(["super_admin", "admin", "formateur"]),
  controller.update
);
router.put(
  "/:id/accept",
  auth,
  requireRole(["super_admin", "admin", "formateur"]),
  controller.acceptUser
);
router.delete(
  "/:id",
  auth,
  requireRole(["super_admin", "admin", "formateur"]),
  controller.delete
);

module.exports = router;
