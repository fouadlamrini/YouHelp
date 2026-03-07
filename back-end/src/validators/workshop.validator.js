const yup = require("yup");

const createWorkshopSchema = yup.object({
  title: yup.string().trim().required("Title required"),
  description: yup.string().trim().nullable().optional(),
  date: yup.date().nullable().transform((v, o) => (o === "" || o == null ? null : new Date(o))).optional(),
});

const requestFromPostSchema = yup.object({
  postId: yup.string().required("postId required"),
});

const acceptRequestSchema = yup.object({
  title: yup.string().trim().required("Le titre du workchop est requis."),
  description: yup.string().trim().nullable().optional(),
  date: yup.date().nullable().transform((v, o) => (o === "" || o == null ? null : new Date(o))).optional(),
});

module.exports = {
  createWorkshopSchema,
  requestFromPostSchema,
  acceptRequestSchema,
};
