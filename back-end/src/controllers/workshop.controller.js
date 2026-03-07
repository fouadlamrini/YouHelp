const workshopService = require("../services/workshop.service");

class WorkshopController {
  async createWorkshop(req, res) {
    try {
      const result = await workshopService.createWorkshop(req.user.id, req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.status(201).json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async getAllWorkshops(req, res) {
    try {
      const result = await workshopService.getAllWorkshops();
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async requestWorkshop(req, res) {
    try {
      const result = await workshopService.requestWorkshop(req.user.id, req.params.workshopId);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.status(201).json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      if (err.code === 11000) return res.status(400).json({ message: "Request already exists" });
      return res.status(500).json({ message: "Server error" });
    }
  }

  async getMyRequests(req, res) {
    try {
      const result = await workshopService.getMyRequests(req.user.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async requestFromPost(req, res) {
    try {
      if (req.user.role !== "etudiant") {
        return res.status(403).json({ message: "Seuls les étudiants peuvent demander un workchop depuis un post." });
      }
      const result = await workshopService.requestFromPost(req.user.id, req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.status(201).json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      if (err.code === 11000) return res.status(400).json({ message: "Demande déjà existante." });
      return res.status(500).json({ message: "Server error" });
    }
  }

  async getPendingForFormateur(req, res) {
    try {
      if (req.user.role !== "formateur") {
        return res.status(403).json({ message: "Réservé aux formateurs." });
      }
      const result = await workshopService.getPendingForFormateur(req.user.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async acceptRequest(req, res) {
    try {
      if (req.user.role !== "formateur") {
        return res.status(403).json({ message: "Réservé aux formateurs." });
      }
      const result = await workshopService.acceptRequest(req.user.id, req.params.id, req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async rejectRequest(req, res) {
    try {
      if (req.user.role !== "formateur") {
        return res.status(403).json({ message: "Réservé aux formateurs." });
      }
      const result = await workshopService.rejectRequest(req.user.id, req.params.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async getMyWorkshops(req, res) {
    try {
      const result = await workshopService.getMyWorkshops(req.user.id);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new WorkshopController();
