const CallHistory = require("../models/CallHistory");

function ensureDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function createRingingCall({ callId, callerId, calleeId, type }) {
  await CallHistory.create({
    callId,
    caller: callerId,
    callee: calleeId,
    type,
    status: "ringing",
    startedAt: new Date(),
  });
}

async function markInProgress(callId) {
  await CallHistory.findOneAndUpdate(
    { callId },
    {
      status: "in_progress",
      answeredAt: new Date(),
    }
  );
}

async function finalizeCall(callId, status, endedBy) {
  const call = await CallHistory.findOne({ callId });
  if (!call) return;

  const now = new Date();
  const referenceStart = ensureDate(call.answeredAt || call.startedAt);
  const durationSec =
    status === "terminated" && referenceStart
      ? Math.max(0, Math.floor((now.getTime() - referenceStart.getTime()) / 1000))
      : 0;

  call.status = status;
  call.endedAt = now;
  call.durationSec = durationSec;
  call.endedBy = endedBy || null;
  await call.save();
}

async function getUserHistory(userId) {
  const rows = await CallHistory.find({
    $or: [{ caller: userId }, { callee: userId }],
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("caller", "name profilePicture")
    .populate("callee", "name profilePicture")
    .lean();

  return { data: rows };
}

module.exports = {
  createRingingCall,
  markInProgress,
  finalizeCall,
  getUserHistory,
};
