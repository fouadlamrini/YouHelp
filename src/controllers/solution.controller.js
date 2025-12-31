const Solution = require("../models/Solution");
const Post = require("../models/Post");
const User = require("../models/User");

class SolutionController {
  // Marquer un post comme résolu avec une description de la solution
  // - Seul le formateur ou l'owner du post peut marquer comme résolu
  // - Le post doit exister et ne pas être déjà résolu
  // - Une description de la solution est obligatoire
  async markPostAsSolved(req, res) {
    try {
      const { id } = req.params; // id du post
      const { description } = req.body; // description de la solution

      // Vérifier que la description est fournie
      if (!description || description.trim() === "") {
        return res.status(400).json({
          message: "La description de la solution est obligatoire",
        });
      }

      // Vérifier que le post existe
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ message: "Post introuvable" });
      }

      // Vérifier que l'utilisateur est soit le formateur soit l'owner du post
      const user = await User.findById(req.user.id);
      const isOwner = post.author.toString() === req.user.id;
      const isFormateur = user.role === "formateur";
      const isAdmin = user.role === "admin";

      if (!isOwner && !isFormateur && !isAdmin) {
        return res.status(403).json({
          message: "Seul le formateur ou l'owner du post peut marquer comme résolu",
        });
      }

      // Vérifier que le post n'est pas déjà résolu
      if (post.isSolved) {
        return res.status(400).json({
          message: "Ce post est déjà marqué comme résolu",
        });
      }

      // Créer la solution
      const solution = await Solution.create({
        post: id,
        description,
        markedBy: req.user.id,
      });

      // Marquer le post comme résolu
      await Post.findByIdAndUpdate(id, { isSolved: true });

      res.status(201).json({
        success: true,
        message: "Post marqué comme résolu",
        data: solution,
      });
    } catch (err) {
      console.error(err);
      // Gérer l'erreur d'unicité (post déjà a une solution)
      if (err.code === 11000) {
        return res.status(400).json({
          message: "Ce post a déjà une solution enregistrée",
        });
      }
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  // Retirer la solution d'un post (marquer comme non résolu)
  // - Seul le formateur ou l'owner du post peut retirer la solution
  // - Le post doit être marqué comme résolu
  async unmarkPostAsSolved(req, res) {
    try {
      const { id } = req.params; // id du post

      // Vérifier que le post existe
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ message: "Post introuvable" });
      }

      // Vérifier que l'utilisateur est soit le formateur soit l'owner du post
      const user = await User.findById(req.user.id);
      const isOwner = post.author.toString() === req.user.id;
      const isFormateur = user.role === "formateur";
      const isAdmin = user.role === "admin";

      if (!isOwner && !isFormateur && !isAdmin) {
        return res.status(403).json({
          message: "Seul le formateur ou l'owner du post peut retirer la solution",
        });
      }

      // Vérifier que le post est marqué comme résolu
      if (!post.isSolved) {
        return res.status(400).json({
          message: "Ce post n'est pas marqué comme résolu",
        });
      }

      // Supprimer la solution
      await Solution.deleteOne({ post: id });

      // Marquer le post comme non résolu
      await Post.findByIdAndUpdate(id, { isSolved: false });

      res.json({
        success: true,
        message: "Solution retirée, post marqué comme non résolu",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  // Récupérer la solution d'un post
  // - Retourne la solution avec les détails du post et de l'utilisateur qui a marqué
  async getSolutionByPostId(req, res) {
    try {
      const { id } = req.params; // id du post

      // Vérifier que le post existe
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ message: "Post introuvable" });
      }

      // Récupérer la solution si elle existe
      const solution = await Solution.findOne({ post: id })
        .populate("markedBy", "name email role")
        .populate("post", "title content isSolved");

      if (!solution) {
        return res.status(404).json({
          message: "Aucune solution trouvée pour ce post",
        });
      }

      res.json({ success: true, data: solution });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  // Récupérer tous les posts résolus
  // - Retourne la liste des posts marqués comme résolus avec leurs solutions
  async getAllSolvedPosts(req, res) {
    try {
      // Récupérer tous les posts résolus avec leurs solutions
      const solutions = await Solution.find()
        .populate("post", "title content author category subCategory isSolved")
        .populate("markedBy", "name email role")
        .sort({ createdAt: -1 });

      res.json({ success: true, data: solutions });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  // Mettre à jour la description de la solution
  // - Seul le formateur ou l'owner du post peut mettre à jour la description
  // - La solution doit exister
  // - Une nouvelle description est obligatoire
  async updateSolutionDescription(req, res) {
    try {
      const { id } = req.params; // id du post
      const { description } = req.body; // nouvelle description

      // Vérifier que la nouvelle description est fournie
      if (!description || description.trim() === "") {
        return res.status(400).json({
          message: "La nouvelle description de la solution est obligatoire",
        });
      }

      // Vérifier que le post existe
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ message: "Post introuvable" });
      }

      // Vérifier que la solution existe
      const solution = await Solution.findOne({ post: id });
      if (!solution) {
        return res.status(404).json({
          message: "Aucune solution trouvée pour ce post",
        });
      }

      // Vérifier que l'utilisateur est soit le formateur soit l'owner du post
      const user = await User.findById(req.user.id);
      const isOwner = post.author.toString() === req.user.id;
      const isFormateur = user.role === "formateur";
      const isAdmin = user.role === "admin";

      if (!isOwner && !isFormateur && !isAdmin) {
        return res.status(403).json({
          message: "Seul le formateur ou l'owner du post peut mettre à jour la solution",
        });
      }

      // Mettre à jour la description de la solution
      solution.description = description;
      await solution.save();

      res.json({
        success: true,
        message: "Description de la solution mise à jour",
        data: solution,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
}

module.exports = new SolutionController();
