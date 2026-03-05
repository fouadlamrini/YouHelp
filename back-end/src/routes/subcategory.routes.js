const express = require("express");
const router = express.Router();
const subCategoryController = require("../controllers/subcategory.controller");
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.get(
  "/",
  authMiddleware,
  requireRole(["formateur", "admin", "super_admin", "etudiant"]),
  subCategoryController.getAllSubCategories
);

router.get(
  "/category/:categoryId",
  authMiddleware,
  requireRole(["formateur", "admin", "super_admin", "etudiant"]),
  subCategoryController.getByCategory
);

router.post(
  "/",
  authMiddleware,
  requireRole(["formateur", "admin", "super_admin"]),
  subCategoryController.createSubCategory
);

router.put(
  "/:id",
  authMiddleware,
  requireRole(["formateur", "admin", "super_admin"]),
  subCategoryController.updateSubCategory
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole(["formateur", "admin", "super_admin"]),
  subCategoryController.deleteSubCategory
);

module.exports = router;
