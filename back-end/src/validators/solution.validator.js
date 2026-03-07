const yup = require("yup");

const markPostAsSolvedSchema = yup.object({
  description: yup
    .string()
    .trim()
    .required("La description de la solution est obligatoire"),
});

module.exports = {
  markPostAsSolvedSchema,
};
