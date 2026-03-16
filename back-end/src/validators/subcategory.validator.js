const yup = require("yup");

const createSubCategorySchema = yup.object({
  name: yup.string().trim().required("Le nom de la sous-catégorie est requis."),
  category: yup.string().trim().required("Catégorie parente requise."),
});

const updateSubCategorySchema = yup.object({
  name: yup.string().trim().optional(),
  category: yup.string().trim().optional(),
});

module.exports = {
  createSubCategorySchema,
  updateSubCategorySchema,
};
