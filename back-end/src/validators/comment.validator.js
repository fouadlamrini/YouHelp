const yup = require("yup");

const createCommentSchema = yup.object({
  content: yup.string().required("Le contenu du commentaire est requis"),
  parentComment: yup.string().nullable().optional(),
});

module.exports = {
  createCommentSchema,
};
