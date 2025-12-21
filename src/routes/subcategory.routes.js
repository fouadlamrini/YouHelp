const express = require("express");
const router = express.Router();
const subCategoryController = require("../controllers/subcategory.controller");
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.get("/", authMiddleware, subCategoryController.getAllSubCategories);

router.post(
  "/",
  authMiddleware,
  requireRole(["formateur", "admin"]),
  subCategoryController.createSubCategory
);

router.put(
  "/:id",
  authMiddleware,
  requireRole(["formateur", "admin"]),
  subCategoryController.updateSubCategory
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole(["formateur", "admin"]),
  subCategoryController.deleteSubCategory
);

module.exports = router;
