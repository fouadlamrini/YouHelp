const mongoose = require("mongoose");
const { emitNotification } = require("../config/notificationEmitter");

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: [
        "new_registration",
        "user_activated",
        "user_refused",
        "post_deleted_by_admin",
        "post_solved_by_admin",
        "post_reaction",
        "post_share",
        "post_comment",
        "comment_reply",
        "comment_like",
        "knowledge_deleted",
        "knowledge_share",
        "knowledge_comment",
        "knowledge_comment_reply",
        "workchop_request",
        "workchop_accepted",
        "workchop_rejected",
        // Amis
        "friend_request_accepted",
      ],
      required: true,
    },
    message: { type: String, required: true },
    relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    link: { type: String, default: "/users" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

function toPayload(doc) {
  if (!doc) return null;
  return {
    id: doc._id?.toString?.() || doc._id,
    type: doc.type,
    recipient: doc.recipient?.toString?.() || doc.recipient,
    read: doc.read,
    createdAt: doc.createdAt,
  };
}

notificationSchema.post("save", function postSave(doc) {
  const payload = toPayload(doc);
  if (payload?.recipient) {
    emitNotification(payload.recipient, payload);
  }
});

notificationSchema.post("insertMany", function postInsertMany(docs) {
  if (!Array.isArray(docs)) return;
  docs.forEach((doc) => {
    const payload = toPayload(doc);
    if (payload?.recipient) {
      emitNotification(payload.recipient, payload);
    }
  });
});

module.exports = mongoose.model("Notification", notificationSchema);
