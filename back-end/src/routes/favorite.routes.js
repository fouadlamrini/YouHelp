const express = require("express");
const favoriteController = require("../controllers/favorite.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// POST /api/favorites - Ajouter un contenu aux favoris
// Body: { contentType: "post" | "knowledge", contentId: "ObjectId" }
router.post("/", favoriteController.addToFavorites);

// DELETE /api/favorites - Supprimer un contenu des favoris
// Body: { contentType: "post" | "knowledge", contentId: "ObjectId" }
router.delete("/", favoriteController.removeFromFavorites);

// GET /api/favorites - Récupérer tous les favoris de l'utilisateur connecté
// Query params: ?page=1&limit=10
router.get("/", favoriteController.getUserFavorites);

// GET /api/favorites/check/:contentType/:contentId - Vérifier si un contenu est favori
// Params: contentType (post|knowledge), contentId (ObjectId)
router.get("/check/:contentType/:contentId", favoriteController.checkIfFavorite);

module.exports = router;