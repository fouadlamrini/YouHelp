function refId(ref) {
  if (!ref) return null;
  return (ref._id || ref).toString();
}

function getClassNickname(user) {
  if (!user) return null;
  return user.class?.nickName || null;
}

function getClassYear(user) {
  if (!user) return null;
  return user.class?.year || null;
}


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
  // Keep year as a soft check only when both are explicitly provided.
  // This avoids false negatives when class.year is missing in one side.
  const sameYear =
    yearA == null || yearB == null
      ? true
      : String(yearA) === String(yearB);
  const sameLevel = levelA && levelB && levelA === levelB;

  return sameCampus && sameClass && sameNickname && sameYear && sameLevel;
}

module.exports = {
  refId,
  getClassNickname,
  getClassYear,
  haveSameClassContext,
};

