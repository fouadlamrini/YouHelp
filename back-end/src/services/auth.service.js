const User = require("../models/User");
const Role = require("../models/Role");
const Campus = require("../models/Campus");
const Class = require("../models/Class");
const Level = require("../models/Level");
const jwt = require("jsonwebtoken");
const { notifyNewRegistration } = require("./notification.service");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES;

// Helper: construit le payload du JWT (id + role).
function buildTokenPayload(userId, roleName) {
  return { id: userId, role: roleName };
}

// Helper: signe un token JWT avec secret et expiration.
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

// Helper: formate l'utilisateur pour la reponse (inclut le nom du role).
function formatUserForResponse(user, roleName) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    status: user.status,
    role: roleName,
    profilePicture: user.profilePicture,
    completeProfile: user.completeProfile,
  };
}

// Helper: recupere le nom du role associe a l'utilisateur.
async function getRoleName(user) {
  if (!user || !user.role) return "etudiant";
  const roleDocument = await Role.findById(user.role);
  return roleDocument ? roleDocument.name : "etudiant";
}

async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) return { error: { status: 400, message: "Email already in use" } };

  const userCount = await User.countDocuments();
  let role = null;
  let roleName = "etudiant";
  let status = "pending";
  let completeProfile = false;

  if (userCount === 0) {
    const superAdminRole = await Role.findOne({ name: "super_admin" });
    if (!superAdminRole) return { error: { status: 500, message: "super_admin role not found" } };
    role = superAdminRole._id;
    roleName = superAdminRole.name;
    status = "active";
    completeProfile = true;
  } else {
    const etudiantRole = await Role.findOne({ name: "etudiant" });
    if (etudiantRole) role = etudiantRole._id;
  }

  const user = await User.create({ name, email, password, role, status, completeProfile });
  const token = signToken(buildTokenPayload(user._id, roleName));
  return { user, roleName, token };
}

async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) return { error: { status: 400, message: "Invalid credentials" } };
  const matched = await user.comparePassword(password);
  if (!matched) return { error: { status: 400, message: "Invalid credentials" } };
  const roleName = await getRoleName(user);
  const token = signToken(buildTokenPayload(user._id, roleName));
  return { user, roleName, token };
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId);
  if (!user) return { error: { status: 404, message: "User not found" } };
  if (!user.password) return { error: { status: 400, message: "Cannot change password for OAuth accounts" } };
  const matched = await user.comparePassword(currentPassword);
  if (!matched) return { error: { status: 400, message: "Current password is incorrect" } };
  user.password = newPassword;
  await user.save();
  return { ok: true };
}

// Helper: extrait le token JWT depuis le header Authorization.
function extractTokenFromHeader(authHeader) {
  if (!authHeader) return null;
  if (authHeader.startsWith("Bearer")) return authHeader.split(" ")[1];
  return authHeader;
}

// Helper: charge les options necessaires pour completer le profil.
async function getCompleteProfileOptions() {
  const [campuses, classes, levels] = await Promise.all([
    Campus.find().sort({ name: 1 }).lean(),
    Class.find().sort({ name: 1 }).lean(),
    Level.find().sort({ name: 1 }).lean(),
  ]);
  return { campuses, classes, levels };
}

async function completeProfile(userId, body) {
  const user = await User.findById(userId);
  if (!user) return { error: { status: 404, message: "User not found" } };
  if (user.completeProfile) return { error: { status: 400, message: "Profile already completed" } };

  const { campus, class: classId, level, profilePicture } = body;
  const updateData = { completeProfile: true };
  // For standard users, profile completion moves them to "pending"
  // so that an admin can activate. If the user is already "active"
  // (e.g. first super_admin), we keep that status.
  if (user.status !== "active") {
    updateData.status = "pending";
  }
  if (campus !== undefined) updateData.campus = campus || null;
  if (classId !== undefined) updateData.class = classId || null;
  if (level !== undefined) updateData.level = level || null;
  if (profilePicture !== undefined) updateData.profilePicture = profilePicture || user.profilePicture;

  const updated = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("role", "name")
    .populate("campus", "name")
    .populate("class", "name")
    .populate("level", "name")
    .select("-password");

  await notifyNewRegistration(updated).catch((err) => console.error("notifyNewRegistration:", err));
  return { data: updated };
}

module.exports = {
  register,
  login,
  changePassword,
  extractTokenFromHeader,
  getCompleteProfileOptions,
  completeProfile,
  formatUserForResponse,
  getRoleName,
};
