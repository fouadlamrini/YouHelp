const User = require("../models/User");
const Role = require("../models/Role");
const { isUserOnline, getLastSeen } = require("../config/socket");
const { notifyUserActivated, notifyUserRefused } = require("./notification.service");
const { refId, haveSameClassContext } = require("../utils/contextUtils");

/** Get current user doc with role (and campus, class) for permission checks */
async function getCurrentUserWithContext(userId) {
  return User.findById(userId)
    .populate("role", "name")
    .populate("campus", "name")
    .populate("class", "name nickName year")
    .populate("level", "name");
}

/** Check if current user can manage target user (for get/update/delete) */
async function canManage(currentUserDoc, targetUserId) {
  const roleName = currentUserDoc.role?.name || null;
  if (roleName === "super_admin") return true;
  const target = await User.findById(targetUserId).populate("role", "name");
  if (!target) return false;
  const targetRoleName = target.role?.name || null;
  if (roleName === "admin") {
    if (targetRoleName === "super_admin") return false;
    if (currentUserDoc.campus && target.campus) {
      return currentUserDoc.campus._id.toString() === target.campus.toString();
    }
    return true;
  }
  if (roleName === "formateur") {
    if (targetRoleName !== "etudiant") return false;
    if (currentUserDoc.class && target.class) {
      return currentUserDoc.class._id.toString() === target.class.toString();
    }
    return true;
  }
  return false;
}

/** Check if current user can accept target user */
async function canAcceptUser(currentUserDoc, targetUserDoc) {
  const roleName = currentUserDoc.role?.name || null;
  if (roleName === "super_admin") return true;
  if (roleName === "admin") {
    const currId = refId(currentUserDoc.campus);
    const tgtId = refId(targetUserDoc.campus);
    if (!currId || !tgtId) return false;
    return currId === tgtId;
  }
  if (roleName === "formateur") {
    if (!targetUserDoc.role || targetUserDoc.role.name !== "etudiant") return false;
    return haveSameClassContext(currentUserDoc, targetUserDoc);
  }
  return false;
}

/** Build filter for list users: super_admin all, admin same campus, formateur same class */
async function buildListFilter(currentUserDoc) {
  const roleName = currentUserDoc.role?.name || null;
  if (roleName === "super_admin") return {};
  if (roleName === "admin") {
    const superAdminRole = await Role.findOne({ name: "super_admin" });
    const filter = {};
    if (superAdminRole) filter.role = { $ne: superAdminRole._id };
    if (currentUserDoc.campus) filter.campus = currentUserDoc.campus._id;
    return filter;
  }
  if (roleName === "formateur") {
    const etudiantRole = await Role.findOne({ name: "etudiant" });
    if (!etudiantRole) return { _id: -1 };
    const filter = { role: etudiantRole._id };
    if (currentUserDoc.class) filter.class = currentUserDoc.class._id;
    return filter;
  }
  return { _id: -1 };
}

async function getMe(userId) {
  const user = await User.findById(userId)
    .populate("role", "name")
    .populate("campus", "name")
    .populate("class", "name nickName year")
    .populate("level", "name")
    .select("-password");
  if (!user) return { error: { status: 404, message: "User not found" } };
  return { data: user };
}

async function updateProfile(userId, body) {
  const { name, profilePicture, coverPicture, campus, class: classId, level, specialite } = body;
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
  if (coverPicture !== undefined) updateData.coverPicture = coverPicture;
  if (campus !== undefined) updateData.campus = campus || null;
  if (classId !== undefined) updateData.class = classId || null;
  if (level !== undefined) updateData.level = level || null;
  if (specialite !== undefined) updateData.specialite = specialite || null;
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("role", "name")
    .populate("campus", "name")
    .populate("class", "name nickName year")
    .populate("level", "name")
    .select("-password");
  if (!user) return { error: { status: 404, message: "User not found" } };
  return { data: user };
}

async function getAll(currentUserId, query = {}) {
  const current = await getCurrentUserWithContext(currentUserId);
  if (!current) return { error: { status: 401, message: "Unauthorized" } };
  const filter = await buildListFilter(current);
  filter.completeProfile = true;
  if (query.campus) filter.campus = query.campus;
  if (query.class) filter.class = query.class;
  if (query.level) filter.level = query.level;
  const users = await User.find(filter)
    .populate("role", "name")
    .populate("campus", "name")
    .populate("class", "name nickName year")
    .populate("level", "name")
    .select("-password")
    .sort({ createdAt: -1 });

  const enriched = users.map((u) => {
    const plain = u.toObject();
    const id = plain._id.toString();
    plain.online = isUserOnline(id);
    const ls = getLastSeen(id);
    plain.lastSeen = ls ? (ls.toISOString ? ls.toISOString() : ls) : null;
    return plain;
  });

  return { data: enriched };
}

async function getById(currentUserId, targetUserId) {
  const current = await getCurrentUserWithContext(currentUserId);
  if (!current) return { error: { status: 401, message: "Unauthorized" } };
  const allowed = await canManage(current, targetUserId);
  if (!allowed) return { error: { status: 403, message: "Forbidden" } };
  const user = await User.findById(targetUserId)
    .populate("role", "name")
    .populate("campus", "name")
    .populate("class", "name nickName year")
    .populate("level", "name")
    .select("-password");
  if (!user) return { error: { status: 404, message: "User not found" } };
  const plain = user.toObject();
  const id = plain._id.toString();
  plain.online = isUserOnline(id);
  const ls = getLastSeen(id);
  plain.lastSeen = ls ? (ls.toISOString ? ls.toISOString() : ls) : null;
  return { data: plain };
}

async function update(currentUserId, targetUserId, body) {
  const current = await getCurrentUserWithContext(currentUserId);
  if (!current) return { error: { status: 401, message: "Unauthorized" } };
  const allowed = await canManage(current, targetUserId);
  if (!allowed) return { error: { status: 403, message: "Forbidden" } };
  const { name, email, role: roleId, campus, class: classId, level, profilePicture, status: statusValue } = body;
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email.toLowerCase();
  if (campus !== undefined) updateData.campus = campus || null;
  if (classId !== undefined) updateData.class = classId || null;
  if (level !== undefined) updateData.level = level || null;
  if (profilePicture !== undefined) updateData.profilePicture = profilePicture || null;
  if (statusValue !== undefined && ["active", "inactive"].includes(statusValue)) {
    const target = await User.findById(targetUserId).populate("role", "name");
    const targetRoleName = target?.role?.name ?? null;
    if (targetRoleName === "super_admin") return { error: { status: 403, message: "Cannot change super_admin status" } };
    updateData.status = statusValue;
  }
  if (roleId !== undefined) {
    const roleDoc = await Role.findById(roleId);
    if (!roleDoc) return { error: { status: 400, message: "Role not found" } };
    const roleName = roleDoc.name;
    if (current.role?.name === "admin" && roleName === "super_admin")
      return { error: { status: 403, message: "Cannot assign super_admin" } };
    if (current.role?.name === "formateur" && roleName !== "etudiant")
      return { error: { status: 403, message: "Formateur can only assign etudiant" } };
    updateData.role = roleDoc._id;
  }
  const user = await User.findByIdAndUpdate(targetUserId, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("role", "name")
    .populate("campus", "name")
    .populate("class", "name nickName year")
    .populate("level", "name")
    .select("-password");
  if (!user) return { error: { status: 404, message: "User not found" } };
  return { data: user };
}

async function deleteUser(currentUserId, targetUserId) {
  if (targetUserId === currentUserId) {
    return { error: { status: 400, message: "Cannot delete yourself" } };
  }
  const current = await getCurrentUserWithContext(currentUserId);
  if (!current) return { error: { status: 401, message: "Unauthorized" } };
  const allowed = await canManage(current, targetUserId);
  if (!allowed) return { error: { status: 403, message: "Forbidden" } };
  const user = await User.findByIdAndDelete(targetUserId);
  if (!user) return { error: { status: 404, message: "User not found" } };
  return { ok: true };
}

async function deleteSelf(userId) {
  const user = await User.findByIdAndDelete(userId);
  if (!user) return { error: { status: 404, message: "User not found" } };
  return { ok: true };
}

async function acceptUser(currentUserId, targetUserId) {
  const current = await getCurrentUserWithContext(currentUserId);
  if (!current) return { error: { status: 401, message: "Unauthorized" } };
  const target = await User.findById(targetUserId)
    .populate("role", "name")
    .populate("campus", "name")
    .populate("class", "name nickName year")
    .populate("level", "name");
  if (!target) return { error: { status: 404, message: "User not found" } };
  if (target.status === "active") return { error: { status: 400, message: "User already accepted" } };
  const can = await canAcceptUser(current, target);
  if (!can) return { error: { status: 403, message: "Forbidden" } };
  await User.findByIdAndUpdate(targetUserId, { status: "active" });
  const updated = await User.findById(targetUserId)
    .populate("role", "name")
    .populate("campus", "name")
    .populate("class", "name nickName year")
    .populate("level", "name")
    .select("-password");
  await notifyUserActivated(current, target).catch((err) => console.error("notifyUserActivated:", err));
  return { data: updated };
}

async function rejectUser(currentUserId, targetUserId) {
  const current = await getCurrentUserWithContext(currentUserId);
  if (!current) return { error: { status: 401, message: "Unauthorized" } };
  const target = await User.findById(targetUserId)
    .populate("role", "name")
    .populate("campus", "name")
    .populate("class", "name nickName year")
    .populate("level", "name");
  if (!target) return { error: { status: 404, message: "User not found" } };
  if (target.status === "rejected") return { error: { status: 400, message: "User already rejected" } };
  const can = await canAcceptUser(current, target);
  if (!can) return { error: { status: 403, message: "Forbidden" } };
  await User.findByIdAndUpdate(targetUserId, { status: "rejected" });
  const updated = await User.findById(targetUserId)
    .populate("role", "name")
    .populate("campus", "name")
    .populate("class", "name nickName year")
    .populate("level", "name")
    .select("-password");
  await notifyUserRefused(current, target).catch((err) => console.error("notifyUserRefused:", err));
  return { data: updated };
}

async function create(currentUserId, body) {
  const current = await getCurrentUserWithContext(currentUserId);
  if (!current) return { error: { status: 401, message: "Unauthorized" } };
  const roleName = current.role?.name || null;
  if (roleName !== "super_admin" && roleName !== "admin" && roleName !== "formateur") {
    return { error: { status: 403, message: "Forbidden" } };
  }
  const { name, email, password, role: roleId, campus, class: classId, level, profilePicture } = body;
  const trimmedName = typeof name === "string" ? name.trim() : "";
  const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const existing = await User.findOne({ email: trimmedEmail });
  if (existing) return { error: { status: 400, message: "Email already in use" } };
  const roleDoc = roleId ? await Role.findById(roleId) : null;
  const newRoleName = roleDoc?.name || null;
  if (roleName === "admin" && newRoleName === "super_admin")
    return { error: { status: 403, message: "Cannot create super_admin" } };
  if (roleName === "formateur" && newRoleName !== "etudiant")
    return { error: { status: 403, message: "Formateur can only create etudiant" } };
  const user = await User.create({
    name: trimmedName,
    email: trimmedEmail,
    password,
    role: roleDoc?._id || null,
    campus: campus || null,
    class: classId || null,
    level: level || null,
    profilePicture: profilePicture || undefined,
    completeProfile: true,
    status: "active",
  });
  const populated = await User.findById(user._id)
    .populate("role", "name")
    .populate("campus", "name")
    .populate("class", "name nickName year")
    .populate("level", "name")
    .select("-password");
  return { data: populated };
}

module.exports = {
  getMe,
  updateProfile,
  getAll,
  getById,
  update,
  deleteUser,
  deleteSelf,
  acceptUser,
  rejectUser,
  create,
};
