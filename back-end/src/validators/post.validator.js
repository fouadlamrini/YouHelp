const yup = require("yup");

const createPostSchema = yup.object({
  content: yup.string().trim().required("Le contenu est obligatoire."),
  category: yup.string().trim().required("Category is required."),
  subCategory: yup.string().trim().nullable().optional(),
});

const updatePostSchema = yup.object({
  content: yup.string().trim().optional(),
  category: yup.string().trim().nullable().optional(),
  subCategory: yup.string().trim().nullable().optional(),
  existingMedia: yup.mixed().optional(),
});

module.exports = {
  createPostSchema,
  updatePostSchema,
};
