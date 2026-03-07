const User = require("../models/User");
const favoriteService = require("../services/favorite.service");

class FavoriteController {
  addToFavorites = async (req, res) => {
    try {
      const currentUser = await User.findById(req.user.id).select("status").lean();
      if (currentUser?.status !== "active") {
        return res.status(403).json({ message: "Seuls les comptes activés peuvent ajouter aux favoris." });
      }
      const result = await favoriteService.addToFavorites(req.user.id, req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.status(201).json({
        success: true,
        message: "Contenu ajouté aux favoris avec succès",
        data: result.data,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur lors de l'ajout aux favoris" });
    }
  };

  removeFromFavorites = async (req, res) => {
    try {
      const currentUser = await User.findById(req.user.id).select("status").lean();
      if (currentUser?.status !== "active") {
        return res.status(403).json({ message: "Seuls les comptes activés peuvent gérer les favoris." });
      }
      const result = await favoriteService.removeFromFavorites(req.user.id, req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.status(200).json({ success: true, message: "Contenu retiré des favoris avec succès" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur lors de la suppression du favori" });
    }
  };

  getUserFavorites = async (req, res) => {
    try {
      const result = await favoriteService.getUserFavorites(req.user.id, req.query);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.status(200).json({
        success: true,
        message: "Favoris récupérés avec succès",
        data: result.data,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur lors de la récupération des favoris" });
    }
  };

  checkIfFavorite = async (req, res) => {
    try {
      const result = await favoriteService.checkIfFavorite(
        req.user.id,
        req.params.contentType,
        req.params.contentId
      );
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.status(200).json({ success: true, isFavorite: result.data.isFavorite });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur lors de la vérification du favori" });
    }
  };
}

module.exports = new FavoriteController();
