const express = require("express");
const path = require("path");
const fs = require("fs");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

// GET /api/avatars -> list of built-in avatar URLs
router.get("/", (req, res) => {
  try {
    const folder = path.join(__dirname, "..", "photo-avatar");
    if (!fs.existsSync(folder)) {
      return res.json({ success: true, data: [] });
    }
    const files = fs
      .readdirSync(folder)
      .filter((file) => !file.startsWith("."));

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const avatars = files.map((file) => ({
      file,
      url: `${baseUrl}/avatars/${file}`,
    }));

    res.json({ success: true, data: avatars });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to list avatars" });
  }
});

// POST /api/avatars/upload -> upload a custom avatar image
router.post("/upload", upload.single("avatar"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // upload.middleware stores images in src/uploads/images
    // Files are served via /uploads in server.js
    const relativePathFromUploads = path
      .relative(path.join("src", "uploads"), req.file.path)
      .replace(/\\/g, "/");

    const publicPath = `/uploads/${relativePathFromUploads}`;
    const url = `${req.protocol}://${req.get("host")}${publicPath}`;

    res.status(201).json({
      success: true,
      data: {
        path: publicPath,
        url,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload avatar" });
  }
});

module.exports = router;

