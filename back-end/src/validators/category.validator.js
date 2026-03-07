const yup = require("yup");

const createCategorySchema = yup.object({
  name: yup.string().trim().required("Le nom de la catégorie est requis."),
  icon: yup.string().trim().nullable().optional(),
  color: yup.string().trim().nullable().optional(),
});

const updateCategorySchema = yup.object({
  name: yup.string().trim().optional(),
  icon: yup.string().trim().nullable().optional(),
  color: yup.string().trim().nullable().optional(),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
