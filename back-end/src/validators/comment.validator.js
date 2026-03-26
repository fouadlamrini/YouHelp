const yup = require("yup");

const createCommentSchema = yup.object({
  content: yup.string().optional(),
  parentComment: yup.string().nullable().optional(),
});

module.exports = {
  createCommentSchema,
};
