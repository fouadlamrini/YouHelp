const yup = require("yup");

const createKnowledgeSchema = yup.object({
  content: yup.string().trim().required("Le contenu est obligatoire"),
  category: yup.string().trim().required("Catégorie requise."),
  subCategory: yup.string().trim().nullable().optional(),
});

const updateKnowledgeSchema = yup.object({
  content: yup.string().trim().optional(),
  category: yup.string().trim().nullable().optional(),
  subCategory: yup.string().trim().nullable().optional(),
  existingMedia: yup.mixed().optional(),
});

module.exports = {
  createKnowledgeSchema,
  updateKnowledgeSchema,
};
