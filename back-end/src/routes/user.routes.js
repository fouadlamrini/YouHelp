const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate");
const { createUserSchema, updateUserSchema } = require("../validators/user.validator");

// Profile (current user)
router.get("/me", auth, controller.getMe);
router.put("/me", auth, controller.updateProfile);
router.delete("/me", auth, controller.deleteMe);

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
  validate(createUserSchema),
  controller.create
);
router.put(
  "/:id",
  auth,
  requireRole(["super_admin", "admin", "formateur"]),
  validate(updateUserSchema),
  controller.update
);
router.put(
  "/:id/accept",
  auth,
  requireRole(["super_admin", "admin", "formateur"]),
  controller.acceptUser
);
router.put(
  "/:id/reject",
  auth,
  requireRole(["super_admin", "admin", "formateur"]),
  controller.rejectUser
);
router.delete(
  "/:id",
  auth,
  requireRole(["super_admin", "admin", "formateur"]),
  controller.delete
);

module.exports = router;
