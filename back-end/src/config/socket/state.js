const userSockets = new Map();
const lastSeenMap = new Map();
const activeCallByUser = new Map();
const callTimersById = new Map();
const callMetaById = new Map();

module.exports = {
  userSockets,
  lastSeenMap,
  activeCallByUser,
  callTimersById,
  callMetaById,
};
