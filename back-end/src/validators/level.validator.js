const yup = require("yup");

const createLevelSchema = yup.object({
  name: yup.string().trim().required("Name is required"),
});

const updateLevelSchema = yup.object({
  name: yup.string().trim().required("Name is required"),
});

module.exports = {
  createLevelSchema,
  updateLevelSchema,
};
