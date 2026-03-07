const yup = require("yup");

const addFavoriteSchema = yup.object({
  contentType: yup
    .string()
    .oneOf(["post", "knowledge"], "Type de contenu invalide. Utilisez 'post' ou 'knowledge'")
    .required("Requête mal formée"),
  contentId: yup.string().required("L'ID du contenu est requis"),
});

const removeFavoriteSchema = yup.object({
  contentType: yup
    .string()
    .oneOf(["post", "knowledge"], "Type de contenu invalide. Utilisez 'post' ou 'knowledge'")
    .required("Requête mal formée"),
  contentId: yup.string().required("L'ID du contenu est requis"),
});

module.exports = {
  addFavoriteSchema,
  removeFavoriteSchema,
};
