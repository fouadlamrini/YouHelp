const yup = require("yup");

const addFriendSchema = yup.object({
  userId: yup.string().required("Invalid userId"),
});

module.exports = {
  addFriendSchema,
};
