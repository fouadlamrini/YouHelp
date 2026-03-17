function refId(ref) {
  if (!ref) return null;
  return (ref._id || ref).toString();
}

function getClassNickname(user) {
  if (!user) return null;
  // Project convention: nickname is stored only on the class (nickName)
  return user.class?.nickName || null;
}

function getClassYear(user) {
  if (!user) return null;
  // Prefer explicit user.year if it exists, otherwise fall back to class.year
  if (user.year !== undefined && user.year !== null) return user.year;
  return user.class?.year || null;
}

/**
 * Check if two users share the same "class context":
 * - same campus
 * - same class
 * - same nickname
 * - same year
 * - same level
 *
 * Works with either populated documents or raw ObjectIds.
 */
function haveSameClassContext(user, otherUser) {
  if (!user || !otherUser) return false;

  const campusA = refId(user.campus);
  const campusB = refId(otherUser.campus);
  const classA = refId(user.class);
  const classB = refId(otherUser.class);
  const levelA = refId(user.level);
  const levelB = refId(otherUser.level);

  const nicknameA = getClassNickname(user);
  const nicknameB = getClassNickname(otherUser);
  const yearA = getClassYear(user);
  const yearB = getClassYear(otherUser);

  const sameCampus = campusA && campusB && campusA === campusB;
  const sameClass = classA && classB && classA === classB;
  const sameNickname =
    nicknameA != null &&
    nicknameB != null &&
    String(nicknameA) === String(nicknameB);
  const sameYear =
    yearA != null &&
    yearB != null &&
    String(yearA) === String(yearB);
  const sameLevel = levelA && levelB && levelA === levelB;

  return sameCampus && sameClass && sameNickname && sameYear && sameLevel;
}

module.exports = {
  refId,
  getClassNickname,
  getClassYear,
  haveSameClassContext,
};

