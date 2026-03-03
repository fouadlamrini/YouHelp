const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

// ===== GET ALL CATEGORIES =====
// accessible by admin, formateur, etudiant, super_admin
router.get(
  '/',
  authMiddleware,
  requireRole(['admin', 'formateur', 'etudiant', 'super_admin']),
  CategoryController.getAllCategory
);

// ===== CREATE / UPDATE / DELETE CATEGORY =====
// accessible by admin & super_admin
router.post(
  '/',
  authMiddleware,
  requireRole(['admin', 'super_admin']),
  CategoryController.createCategory
);

router.put(
  '/:id',
  authMiddleware,
  requireRole(['admin', 'super_admin']),
  CategoryController.updateCategory
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole(['admin', 'super_admin']),
  CategoryController.deleteCategory
);

module.exports = router;
