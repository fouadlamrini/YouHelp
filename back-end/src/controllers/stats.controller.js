const statsService = require("../services/stats.service");

class StatsController {
  getStats = async (req, res) => {
    try {
      const userId = req.user?.id ?? req.user?._id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const result = await statsService.getStats(userId);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error("Stats error:", err);
      return res.status(500).json({ message: "Server error", error: err.message });
    }
  };
}

module.exports = new StatsController();
