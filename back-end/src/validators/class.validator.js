const yup = require("yup");

const yearSchema = yup
  .number()
  .integer("L'année doit être un nombre supérieur ou égal à 2018.")
  .min(2018, "L'année doit être un nombre supérieur ou égal à 2018.")
  .nullable();

const createClassSchema = yup.object({
  name: yup.string().trim().required("Name is required"),
  nickName: yup.string().trim().nullable().optional(),
  year: yearSchema.optional(),
  campus: yup.string().nullable().optional(),
});

const updateClassSchema = yup.object({
  name: yup.string().trim().optional(),
  nickName: yup.string().trim().nullable().optional(),
  year: yearSchema.optional(),
  campus: yup.string().nullable().optional(),
});

module.exports = {
  createClassSchema,
  updateClassSchema,
};
