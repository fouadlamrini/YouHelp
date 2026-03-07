const avatarService = require("../services/avatar.service");

class AvatarController {
  getAvatars = (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const result = avatarService.listAvatars(baseUrl);
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to list avatars" });
    }
  };

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
