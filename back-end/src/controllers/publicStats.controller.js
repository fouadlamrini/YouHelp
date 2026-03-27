const publicStatsService = require("../services/publicStats.service");

class PublicStatsController {
  getStats = async (_req, res) => {
    try {
      const result = await publicStatsService.getPublicStats();
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = new PublicStatsController();
