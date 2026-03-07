const yup = require("yup");

const sendMessageSchema = yup.object({
  receiverId: yup.string().required("receiverId required"),
  content: yup.string().trim().optional(),
});

module.exports = {
  sendMessageSchema,
};
