const { randomUUID } = require("crypto");
const { isObject, getTargetUserId, getOtherUserId } = require("./helpers");
const {
  activeCallByUser,
  callTimersById,
  callMetaById,
} = require("./state");
const callHistoryService = require("../../services/callHistory.service");

const RING_TIMEOUT_MS = 30000;

function registerCallHandlers({ socket, emitToUser }) {
  const userId = socket.userId;

  function clearCallTimer(callId) {
    const timer = callTimersById.get(callId);
    if (timer) {
      clearTimeout(timer);
      callTimersById.delete(callId);
    }
  }

  function setCallBusy(callId, callerId, calleeId) {
    activeCallByUser.set(String(callerId), callId);
    activeCallByUser.set(String(calleeId), callId);
  }

  function releaseCallBusy(callId, callerId, calleeId) {
    if (activeCallByUser.get(String(callerId)) === callId) {
      activeCallByUser.delete(String(callerId));
    }
    if (activeCallByUser.get(String(calleeId)) === callId) {
      activeCallByUser.delete(String(calleeId));
    }
  }

  function findCallMeta(callId, peerUserId) {
    if (callId && callMetaById.has(callId)) return callMetaById.get(callId);
    if (!peerUserId) return null;

    for (const meta of callMetaById.values()) {
      const isParticipant =
        (meta.callerId === userId && meta.calleeId === peerUserId) ||
        (meta.calleeId === userId && meta.callerId === peerUserId);
      if (isParticipant) return meta;
    }
    return null;
  }

  async function startCallRequest(type, eventName, data) {
    const targetUserId = getTargetUserId(data);
    if (!targetUserId) return;

    const payload = isObject(data) ? data : {};
    const { fromUser } = payload;

    if (activeCallByUser.has(userId)) {
      const callId = randomUUID();
      await callHistoryService.createRingingCall({
        callId,
        callerId: userId,
        calleeId: targetUserId,
        type,
      });
      await callHistoryService.finalizeCall(callId, "busy", userId);
      emitToUser(userId, "call:busy", {
        code: "SELF_BUSY",
        message: "Vous êtes déjà en appel.",
      });
      return;
    }

    if (activeCallByUser.has(targetUserId)) {
      const callId = randomUUID();
      await callHistoryService.createRingingCall({
        callId,
        callerId: userId,
        calleeId: targetUserId,
        type,
      });
      await callHistoryService.finalizeCall(callId, "busy", null);
      emitToUser(userId, "call:busy", {
        code: "USER_BUSY",
        message: "Cet utilisateur est déjà en appel avec quelqu'un d'autre.",
      });
      return;
    }

    const callId = randomUUID();
    const meta = {
      callId,
      type,
      callerId: userId,
      calleeId: targetUserId,
      status: "ringing",
      startedAt: new Date(),
    };
    callMetaById.set(callId, meta);

    await callHistoryService.createRingingCall({
      callId,
      callerId: userId,
      calleeId: targetUserId,
      type,
    });

    const timeout = setTimeout(async () => {
      const currentMeta = callMetaById.get(callId);
      if (!currentMeta || currentMeta.status !== "ringing") return;

      callMetaById.delete(callId);
      clearCallTimer(callId);

      await callHistoryService.finalizeCall(callId, "no_answer", null);
      emitToUser(userId, "call:no-answer", {
        callId,
        to: targetUserId,
        message: "Aucune réponse.",
      });
    }, RING_TIMEOUT_MS);

    callTimersById.set(callId, timeout);

    emitToUser(targetUserId, eventName, {
      callId,
      type,
      from: userId,
      to: targetUserId,
      fromUser,
    });
  }

  function joinCallRoom(data, prefix = "") {
    const otherUserId = getOtherUserId(data);
    if (!otherUserId) return;
    const room = prefix + [userId, otherUserId].sort().join("-");
    socket.join(room);
    console.log("[socket] room joined:", room);
  }

  function forwardSessionPayload(eventName, fieldName, data) {
    const targetUserId = getTargetUserId(data);
    if (!targetUserId || !isObject(data) || !data[fieldName]) return;

    emitToUser(targetUserId, eventName, {
      [fieldName]: data[fieldName],
      from: userId,
      callId: data.callId || null,
    });
  }

  async function markCallInProgress(data, eventName) {
    const targetUserId = getTargetUserId(data);
    if (!targetUserId) return;

    const callMeta = findCallMeta(data?.callId, targetUserId);
    if (!callMeta) return;

    callMeta.status = "in_progress";
    clearCallTimer(callMeta.callId);
    setCallBusy(callMeta.callId, callMeta.callerId, callMeta.calleeId);
    await callHistoryService.markInProgress(callMeta.callId);

    emitToUser(targetUserId, eventName, {
      from: userId,
      callId: callMeta.callId,
    });
  }

  async function endCall(data, eventName) {
    const targetUserId = getTargetUserId(data);
    if (!targetUserId) return;

    const callMeta = findCallMeta(data?.callId, targetUserId);
    if (!callMeta) {
      emitToUser(targetUserId, eventName, { from: userId, callId: data?.callId || null });
      return;
    }

    clearCallTimer(callMeta.callId);
    releaseCallBusy(callMeta.callId, callMeta.callerId, callMeta.calleeId);
    callMetaById.delete(callMeta.callId);

    const finalStatus = callMeta.status === "ringing" ? "rejected" : "terminated";
    await callHistoryService.finalizeCall(callMeta.callId, finalStatus, userId);

    emitToUser(targetUserId, eventName, {
      from: userId,
      callId: callMeta.callId,
      status: finalStatus,
    });
  }

  socket.on("video-call-request", async (data) => {
    await startCallRequest("video", "video-call-request", data);
  });

  socket.on("join-video-call", (data) => {
    joinCallRoom(data);
  });

  socket.on("offer", (data) => {
    forwardSessionPayload("offer", "offer", data);
  });

  socket.on("answer", (data) => {
    forwardSessionPayload("answer", "answer", data);
  });

  socket.on("ice-candidate", (data) => {
    forwardSessionPayload("ice-candidate", "candidate", data);
  });

  socket.on("callee-ready", async (data) => {
    await markCallInProgress(data, "callee-ready");
  });

  socket.on("video-call-ended", async (data) => {
    await endCall(data, "video-call-ended");
  });

  socket.on("screen-share-started", (data) => {
    const targetUserId = getTargetUserId(data);
    if (!targetUserId) return;
    emitToUser(targetUserId, "screen-share-started", { from: userId, callId: data?.callId || null });
  });

  socket.on("screen-share-stopped", (data) => {
    const targetUserId = getTargetUserId(data);
    if (!targetUserId) return;
    emitToUser(targetUserId, "screen-share-stopped", { from: userId, callId: data?.callId || null });
  });

  socket.on("voice-call-request", async (data) => {
    await startCallRequest("voice", "voice-call-request", data);
  });

  socket.on("join-voice-call", (data) => {
    joinCallRoom(data, "voice-");
  });

  socket.on("voice-offer", (data) => {
    forwardSessionPayload("voice-offer", "offer", data);
  });

  socket.on("voice-answer", (data) => {
    forwardSessionPayload("voice-answer", "answer", data);
  });

  socket.on("voice-ice-candidate", (data) => {
    forwardSessionPayload("voice-ice-candidate", "candidate", data);
  });

  socket.on("voice-callee-ready", async (data) => {
    await markCallInProgress(data, "voice-callee-ready");
  });

  socket.on("voice-call-ended", async (data) => {
    await endCall(data, "voice-call-ended");
  });

  socket.on("voice-message", (data) => {
    const targetUserId = getTargetUserId(data);
    if (!targetUserId || !isObject(data)) return;

    emitToUser(targetUserId, "voice-message", {
      from: userId,
      to: targetUserId,
      messageId: data.messageId || null,
      attachment: data.attachment || null,
      duration: data.duration || null,
      createdAt: data.createdAt || new Date().toISOString(),
    });
  });
}

module.exports = {
  registerCallHandlers,
};
