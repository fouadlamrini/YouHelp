const yup = require("yup");

const sendFriendRequestSchema = yup.object({
  toUserId: yup.string().required("Invalid user"),
});

module.exports = {
  sendFriendRequestSchema,
};
