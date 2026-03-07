const yup = require("yup");

const requestJoinSchema = yup.object({
  classId: yup.string().required("classId required"),
});

module.exports = {
  requestJoinSchema,
};
