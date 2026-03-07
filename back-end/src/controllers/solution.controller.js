const solutionService = require("../services/solution.service");

class SolutionController {
  async markPostAsSolved(req, res) {
    try {
      const result = await solutionService.markPostAsSolved(req.user.id, req.params.id, req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.status(201).json({
        success: true,
        message: "Post marqué comme résolu",
        data: result.data,
      });
    } catch (err) {
      console.error(err);
      if (err.code === 11000) {
        return res.status(400).json({ message: "Ce post a déjà une solution enregistrée" });
      }
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  async unmarkPostAsSolved(req, res) {
    try {
      const result = await solutionService.unmarkPostAsSolved(req.user.id, req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({
        success: true,
        message: "Solution retirée, post marqué comme non résolu",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  async getSolutionByPostId(req, res) {
    try {
      const result = await solutionService.getSolutionByPostId(req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  async getAllSolvedPosts(req, res) {
    try {
      const result = await solutionService.getAllSolvedPosts();
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  async updateSolutionDescription(req, res) {
    try {
      const result = await solutionService.updateSolutionDescription(req.user.id, req.params.id, req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({
        success: true,
        message: "Description de la solution mise à jour",
        data: result.data,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }
}

module.exports = new SolutionController();
