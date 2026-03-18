
function getMediaType(mimetype) {
  if (!mimetype) return "file";
  if (mimetype.startsWith("image")) return "image";
  if (mimetype.startsWith("video")) return "video";
  if (mimetype === "application/pdf") return "pdf";
  if (mimetype.includes("word")) return "doc";
  return "file";
}

/**
 * @param {string} type - "image"|"video"|"pdf"|"doc"|"file"
 * @returns {"images"|"videos"|"files"}
 */
function getUploadFolder(type) {
  if (type === "image") return "images";
  if (type === "video") return "videos";
  return "files";
}

/**
 * Transforme une liste de fichiers (multer) en tableau { url, type } pour post/knowledge/comment.
 * @param {Array<{ mimetype: string, filename: string }>} files
 * @returns {Array<{ url: string, type: string }>}
 */
function mapFilesToMedia(files) {
  return (files || []).map((file) => {
    const type = getMediaType(file.mimetype);
    const folder = getUploadFolder(type);
    return { url: `/uploads/${folder}/${file.filename}`, type };
  });
}

module.exports = {
  getMediaType,
  getUploadFolder,
  mapFilesToMedia,
};
