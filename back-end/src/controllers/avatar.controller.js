const avatarService = require("../services/avatar.service");

class AvatarController {
  uploadAvatar = (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const result = avatarService.processUpload(req.file, baseUrl);

      return res.status(201).json({
        success: true,
        data: result.data,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to upload avatar" });
    }
  };
}

module.exports = new AvatarController();
