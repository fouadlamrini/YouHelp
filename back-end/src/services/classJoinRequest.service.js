const ClassJoinRequest = require("../models/ClassJoinRequest");
const Class = require("../models/Class");
const User = require("../models/User");

async function create(userId, body) {
  const { classId } = body;
  const classDoc = await Class.findById(classId);
  if (!classDoc) return { error: { status: 404, message: "Class not found" } };
  const existing = await ClassJoinRequest.findOne({ user: userId, class: classId });
  if (existing) {
    if (existing.status === "pending") {
      return { error: { status: 400, message: "You already have a pending request for this class" } };
    }
    if (existing.status === "accepted") {
      return { error: { status: 400, message: "You are already in this class" } };
    }
  }
  const request = await ClassJoinRequest.create({ user: userId, class: classId, status: "pending" });
  const populated = await ClassJoinRequest.findById(request._id)
    .populate("user", "name email")
    .populate("class", "name");
  return { data: populated };
}

async function getRequestsForMyClass(userId) {
  const currentUser = await User.findById(userId).populate("class");
  if (!currentUser?.class) {
    return { error: { status: 403, message: "You are not assigned to a class" } };
  }
  const requests = await ClassJoinRequest.find({ class: currentUser.class._id, status: "pending" })
    .populate("user", "name email")
    .populate("class", "name")
    .sort({ createdAt: -1 });
  return { data: requests };
}

async function accept(userId, requestId) {
  const request = await ClassJoinRequest.findById(requestId).populate("class");
  if (!request) return { error: { status: 404, message: "Request not found" } };
  if (request.status !== "pending") {
    return { error: { status: 400, message: "Request already reviewed" } };
  }
  const formateur = await User.findById(userId).populate("class");
  if (!formateur.class || formateur.class._id.toString() !== request.class._id.toString()) {
    return { error: { status: 403, message: "You can only accept requests for your class" } };
  }
  await User.findByIdAndUpdate(request.user, { class: request.class._id });
  request.status = "accepted";
  await request.save();
  return { ok: true };
}

async function reject(userId, requestId) {
  const request = await ClassJoinRequest.findById(requestId).populate("class");
  if (!request) return { error: { status: 404, message: "Request not found" } };
  if (request.status !== "pending") {
    return { error: { status: 400, message: "Request already reviewed" } };
  }
  const formateur = await User.findById(userId).populate("class");
  if (!formateur.class || formateur.class._id.toString() !== request.class._id.toString()) {
    return { error: { status: 403, message: "You can only reject requests for your class" } };
  }
  request.status = "rejected";
  await request.save();
  return { ok: true };
}

module.exports = {
  create,
  getRequestsForMyClass,
  accept,
  reject,
};
