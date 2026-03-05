/**
 * Reusable permission helpers for feed (Posts & Knowledge).
 * - canRead: always allow reading content.
 * - canInteract: user must be active to interact (create, react, comment, share, favorite).
 * - isItemReadOnly: for "All Campuses" filter, item is read-only if from another campus and author is not a friend.
 */

/**
 * @param {Object} user - Current user (from AuthContext)
 * @returns {boolean} - Always true (reading is allowed for all logged-in users)
 */
export function canRead(user) {
  return true;
}

/**
 * @param {Object} user - Current user (from AuthContext)
 * @param {Object} [item] - Optional feed item (post/knowledge); not used for base rule
 * @returns {boolean} - True if user can interact (create, react, comment, share, add to favorites)
 */
export function canInteract(user, item) {
  if (!user) return false;
  if (user.status !== "active") return false;
  return true;
}

/**
 * For "All Campuses" filter: disable interaction if item is from another campus AND author is not a friend.
 * @param {Object} user - Current user (with campus id and friends array of ids)
 * @param {Object} item - Feed item with author (populated: author.campus or author._id)
 * @returns {boolean} - True if this specific item should be read-only (no react/comment/share/favorite)
 */
export function isItemReadOnly(user, item) {
  if (!user || !item) return true;
  if (user.status !== "active") return true;
  const author = item.author || item.user;
  if (!author) return true;
  const authorId = (author._id || author).toString();
  const authorCampusId = author.campus?._id?.toString?.() ?? author.campus?.toString?.() ?? null;
  const myCampusId = (user.campus?._id ?? user.campus)?.toString?.() ?? user.campus ?? null;
  const friendIds = (user.friends || []).map((id) => (id?.toString?.() ?? id));
  const sameCampus = !!myCampusId && !!authorCampusId && myCampusId === authorCampusId;
  const isFriend = friendIds.includes(authorId);
  if (sameCampus || isFriend) return false;
  return true;
}
