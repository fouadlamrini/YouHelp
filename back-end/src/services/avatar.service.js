const path = require("path");
const fs = require("fs");

const AVATAR_FOLDER = path.join(__dirname, "..", "photo-avatar");

/**
 * List built-in avatars from the photo-avatar folder.
 * Filters out hidden files (starting with .).
 * @param {string} baseUrl - Base URL (e.g. http://localhost:3000)
 * @returns {{ data: Array<{ file: string, url: string }> }}
 */
function listAvatars(baseUrl) {
  if (!fs.existsSync(AVATAR_FOLDER)) {
    return { data: [] };
  }

  const files = fs
    .readdirSync(AVATAR_FOLDER)
    .filter((file) => !file.startsWith("."));

  const avatars = files.map((file) => ({
    file,
    url: `${baseUrl}/avatars/${file}`,
  }));

  return { data: avatars };
}

/**
 * Process an uploaded avatar file: compute public path and full URL.
 * Upload middleware stores files under src/uploads (e.g. images/).
 * @param {Express.Multer.File} file - req.file from multer
 * @param {string} baseUrl - Base URL (e.g. http://localhost:3000)
 * @returns {{ data: { path: string, url: string } }}
 */
function processUpload(file, baseUrl) {
  const uploadsBase = path.join(process.cwd(), "src", "uploads");
  const relativePathFromUploads = path
    .relative(uploadsBase, file.path)
    .replace(/\\/g, "/");

  const publicPath = `/uploads/${relativePathFromUploads}`;
  const url = `${baseUrl}${publicPath}`;

  return {
    data: {
      path: publicPath,
      url,
    },
  };
}

module.exports = {
  listAvatars,
  processUpload,
};
