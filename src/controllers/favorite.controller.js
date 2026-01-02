const Favorite = require("../models/Favorite");
const Post = require("../models/Post");
const Knowledge = require("../models/Knowledge");

class FavoriteController {
  
  // Ajouter un post ou knowledge aux favoris
  async addToFavorites(req, res) {
    try {
      const { contentType, contentId } = req.body;
      const userId = req.user.id;

      // Vérifier que le type de contenu est valide
      if (!["post", "knowledge"].includes(contentType)) {
        return res.status(400).json({ 
          message: "Type de contenu invalide. Utilisez 'post' ou 'knowledge'" 
        });
      }

      // Vérifier que l'ID du contenu est fourni
      if (!contentId) {
        return res.status(400).json({ 
          message: "L'ID du contenu est requis" 
        });
      }

      // Vérifier que le contenu existe
      let content;
      if (contentType === "post") {
        content = await Post.findById(contentId);
        if (!content) {
          return res.status(404).json({ 
            message: "Post non trouvé" 
          });
        }
      } else {
        content = await Knowledge.findById(contentId);
        if (!content) {
          return res.status(404).json({ 
            message: "Connaissance non trouvée" 
          });
        }
      }

      // Vérifier si le contenu est déjà dans les favoris
      const existingFavorite = await Favorite.findOne({
        user: userId,
        [contentType]: contentId
      });

      if (existingFavorite) {
        return res.status(400).json({ 
          message: "Ce contenu est déjà dans vos favoris" 
        });
      }

      // Créer le nouveau favori
      const favoriteData = {
        user: userId,
        contentType: contentType
      };
      favoriteData[contentType] = contentId;

      const favorite = await Favorite.create(favoriteData);

      res.status(201).json({
        success: true,
        message: "Contenu ajouté aux favoris avec succès",
        data: favorite
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        message: "Erreur serveur lors de l'ajout aux favoris" 
      });
    }
  }

  // Supprimer un favori
  async removeFromFavorites(req, res) {
    try {
      const { contentType, contentId } = req.body;
      const userId = req.user.id;

      // Vérifier que le type de contenu est valide
      if (!["post", "knowledge"].includes(contentType)) {
        return res.status(400).json({ 
          message: "Type de contenu invalide. Utilisez 'post' ou 'knowledge'" 
        });
      }

      // Chercher et supprimer le favori
      const favorite = await Favorite.findOneAndDelete({
        user: userId,
        [contentType]: contentId
      });

      if (!favorite) {
        return res.status(404).json({ 
          message: "Ce contenu n'est pas dans vos favoris" 
        });
      }

      res.status(200).json({
        success: true,
        message: "Contenu retiré des favoris avec succès"
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        message: "Erreur serveur lors de la suppression du favori" 
      });
    }
  }

  // Récupérer tous les favoris d'un utilisateur
  async getUserFavorites(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      // Calculer les paramètres de pagination
      const skip = (page - 1) * limit;

      // Récupérer les favoris avec population des données
      const favorites = await Favorite.find({ user: userId })
        .populate({
          path: "post",
          populate: [
            { path: "author", select: "name email" },
            { path: "category", select: "name" },
            { path: "subCategory", select: "name" }
          ]
        })
        .populate({
          path: "knowledge",
          populate: [
            { path: "author", select: "name email" },
            { path: "category", select: "name" },
            { path: "subCategory", select: "name" }
          ]
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Compter le total des favoris
      const total = await Favorite.countDocuments({ user: userId });

      res.status(200).json({
        success: true,
        message: "Favoris récupérés avec succès",
        data: {
          favorites,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        message: "Erreur serveur lors de la récupération des favoris" 
      });
    }
  }

  // Vérifier si un contenu est dans les favoris
  async checkIfFavorite(req, res) {
    try {
      const { contentType, contentId } = req.params;
      const userId = req.user.id;

      // Vérifier que le type de contenu est valide
      if (!["post", "knowledge"].includes(contentType)) {
        return res.status(400).json({ 
          message: "Type de contenu invalide. Utilisez 'post' ou 'knowledge'" 
        });
      }

      // Chercher le favori
      const favorite = await Favorite.findOne({
        user: userId,
        [contentType]: contentId
      });

      res.status(200).json({
        success: true,
        isFavorite: !!favorite
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        message: "Erreur serveur lors de la vérification du favori" 
      });
    }
  }
}

module.exports = new FavoriteController();