const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

// ===== GET ALL CATEGORIES =====
// accessible by admin, formateur, etudiant
router.get(
  '/',
  authMiddleware,
  requireRole(['admin', 'formateur', 'etudiant']),
  CategoryController.getAllCategory
);

// ===== CREATE / UPDATE / DELETE CATEGORY =====
// accessible by admin only
router.post(
  '/',
  authMiddleware,
  requireRole(['admin']),
  CategoryController.createCategory
);

router.put(
  '/:id',
  authMiddleware,
  requireRole(['admin']),
  CategoryController.updateCategory
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole(['admin']),
  CategoryController.deleteCategory
);

module.exports = router;
