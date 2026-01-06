const express = require("express");
const router = express.Router();
const SolutionController = require("../controllers/solution.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

/* ===== READ ===== */
// Récupérer tous les posts résolus
router.get("/", SolutionController.getAllSolvedPosts);

// Récupérer la solution d'un post spécifique
router.get("/:id", SolutionController.getSolutionByPostId);

/* ===== CREATE ===== */
// Marquer un post comme résolu avec une description
// - Authentification requise
// - Seul le formateur ou l'owner du post peut marquer comme résolu
router.post(
  "/:id/mark-solved",
  auth,
  requireRole(["admin", "formateur", "etudiant"]),
  SolutionController.markPostAsSolved
);

/* ===== UPDATE ===== */
// Mettre à jour la description de la solution
// - Authentification requise
// - Seul le formateur ou l'owner du post peut mettre à jour
router.put(
  "/:id/update-description",
  auth,
  requireRole(["admin", "formateur", "etudiant"]),
  SolutionController.updateSolutionDescription
);

/* ===== DELETE ===== */
// Retirer la solution d'un post (marquer comme non résolu)
// - Authentification requise
// - Seul le formateur ou l'owner du post peut retirer la solution
router.delete(
  "/:id/unmark-solved",
  auth,
  requireRole(["admin", "formateur", "etudiant"]),
  SolutionController.unmarkPostAsSolved
);

module.exports = router;
