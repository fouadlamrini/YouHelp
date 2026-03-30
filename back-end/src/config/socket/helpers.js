function toUserId(value) {
  return String(value);
}

function isObject(value) {
  return Boolean(value) && typeof value === "object";
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function getTargetUserId(data) {
  if (!isObject(data) || !hasValue(data.to)) return null;
  return toUserId(data.to);
}

function getOtherUserId(data) {
  if (!isObject(data) || !hasValue(data.otherUserId)) return null;
  return toUserId(data.otherUserId);
}

module.exports = {
  toUserId,
  isObject,
  getTargetUserId,
  getOtherUserId,
};
