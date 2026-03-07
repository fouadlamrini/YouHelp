const yup = require("yup");

const createCampusSchema = yup.object({
  name: yup.string().trim().required("Name is required"),
});

const updateCampusSchema = yup.object({
  name: yup.string().trim().required("Name is required"),
});

module.exports = {
  createCampusSchema,
  updateCampusSchema,
};
