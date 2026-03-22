const path = require("path");


// Helper: construit l'URL publique (path + url) pour un fichier upload.
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
