const path = require("path");

/**
 * Process an uploaded avatar file (from PC): compute public path and full URL.
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
  processUpload,
};
