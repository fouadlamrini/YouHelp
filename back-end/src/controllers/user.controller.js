const User = require("../models/User");
const Role = require("../models/Role");

/** Get current user doc with role (and campus, class) for permission checks */
async function getCurrentUserWithContext(userId) {
  return User.findById(userId)
    .populate("role", "name")
    .populate("campus", "name")
    .populate("class", "name")
    .populate("level", "name");
}

/** Check if current user can manage target user (for get/update/delete) */
async function canManage(currentUserDoc, targetUserId, action = "read") {
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

/** Id for comparison (works for populated doc or raw ObjectId) */
function refId(ref) {
  if (!ref) return null;
  return (ref._id || ref).toString();
}

/** Check if current user can accept target user (admin same campus, super_admin, formateur same campus+class+level) */
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
    const sameCampus = refId(currentUserDoc.campus) && refId(targetUserDoc.campus) &&
      refId(currentUserDoc.campus) === refId(targetUserDoc.campus);
    const sameClass = refId(currentUserDoc.class) && refId(targetUserDoc.class) &&
      refId(currentUserDoc.class) === refId(targetUserDoc.class);
    const sameLevel = refId(currentUserDoc.level) && refId(targetUserDoc.level) &&
      refId(currentUserDoc.level) === refId(targetUserDoc.level);
    return sameCampus && sameClass && sameLevel;
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
    if (currentUserDoc.campus) {
      filter.campus = currentUserDoc.campus._id;
    }
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

class UserController {
  async getMe(req, res) {
    try {
      const user = await User.findById(req.user.id)
        .populate("role", "name")
        .populate("campus", "name")
        .populate("class", "name")
        .populate("level", "name")
        .select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ success: true, data: user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async updateProfile(req, res) {
    try {
      const { name, profilePicture, coverPicture, campus, class: classId, level, specialite } = req.body;
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
      if (coverPicture !== undefined) updateData.coverPicture = coverPicture;
      if (campus !== undefined) updateData.campus = campus || null;
      if (classId !== undefined) updateData.class = classId || null;
      if (level !== undefined) updateData.level = level || null;
      if (specialite !== undefined) updateData.specialite = specialite || null;
      const user = await User.findByIdAndUpdate(req.user.id, updateData, {
        new: true,
        runValidators: true,
      })
        .populate("role", "name")
        .populate("campus", "name")
        .populate("class", "name")
        .populate("level", "name")
        .select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ success: true, data: user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getAll(req, res) {
    try {
      const current = await getCurrentUserWithContext(req.user.id);
      if (!current) return res.status(401).json({ message: "Unauthorized" });
      const filter = await buildListFilter(current);
      const users = await User.find(filter)
        .populate("role", "name")
        .populate("campus", "name")
        .populate("class", "name")
        .populate("level", "name")
        .select("-password")
        .sort({ createdAt: -1 });
      res.json({ success: true, data: users });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getById(req, res) {
    try {
      const current = await getCurrentUserWithContext(req.user.id);
      if (!current) return res.status(401).json({ message: "Unauthorized" });
      const allowed = await canManage(current, req.params.id);
      if (!allowed) return res.status(403).json({ message: "Forbidden" });
      const user = await User.findById(req.params.id)
        .populate("role", "name")
        .populate("campus", "name")
        .populate("class", "name")
        .populate("level", "name")
        .select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ success: true, data: user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async update(req, res) {
    try {
      const current = await getCurrentUserWithContext(req.user.id);
      if (!current) return res.status(401).json({ message: "Unauthorized" });
      const allowed = await canManage(current, req.params.id);
      if (!allowed) return res.status(403).json({ message: "Forbidden" });
      const { name, email, role, campus, class: classId, level, profilePicture } = req.body;
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email.toLowerCase();
      if (campus !== undefined) updateData.campus = campus || null;
      if (classId !== undefined) updateData.class = classId || null;
      if (level !== undefined) updateData.level = level || null;
      if (profilePicture !== undefined) updateData.profilePicture = profilePicture || null;
      if (role !== undefined) {
        const roleDoc = await Role.findById(role);
        if (!roleDoc) return res.status(400).json({ message: "Role not found" });
        const roleName = roleDoc.name;
        if (current.role?.name === "admin" && roleName === "super_admin")
          return res.status(403).json({ message: "Cannot assign super_admin" });
        if (current.role?.name === "formateur" && roleName !== "etudiant")
          return res.status(403).json({ message: "Formateur can only assign etudiant" });
        updateData.role = roleDoc._id;
      }
      const user = await User.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      })
        .populate("role", "name")
        .populate("campus", "name")
        .populate("class", "name")
        .populate("level", "name")
        .select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ success: true, data: user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async delete(req, res) {
    try {
      if (req.params.id === req.user.id) {
        return res.status(400).json({ message: "Cannot delete yourself" });
      }
      const current = await getCurrentUserWithContext(req.user.id);
      if (!current) return res.status(401).json({ message: "Unauthorized" });
      const allowed = await canManage(current, req.params.id);
      if (!allowed) return res.status(403).json({ message: "Forbidden" });
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  /** Accept user (set status active) - super_admin, admin same campus, formateur same campus+class+level */
  async acceptUser(req, res) {
    try {
      const current = await getCurrentUserWithContext(req.user.id);
      if (!current) return res.status(401).json({ message: "Unauthorized" });
      const target = await User.findById(req.params.id)
        .populate("role", "name")
        .populate("campus", "name")
        .populate("class", "name")
        .populate("level", "name");
      if (!target) return res.status(404).json({ message: "User not found" });
      if (target.status === "active") {
        return res.status(400).json({ message: "User already accepted" });
      }
      const can = await canAcceptUser(current, target);
      if (!can) return res.status(403).json({ message: "Forbidden" });
      await User.findByIdAndUpdate(req.params.id, { status: "active" });
      const updated = await User.findById(req.params.id)
        .populate("role", "name")
        .populate("campus", "name")
        .populate("class", "name")
        .populate("level", "name")
        .select("-password");
      res.json({ success: true, data: updated });
    } catch (err) {
      console.error("acceptUser error:", err);
      res.status(500).json({ message: err.message || "Server error" });
    }
  }

  async create(req, res) {
    try {
      const current = await getCurrentUserWithContext(req.user.id);
      if (!current) return res.status(401).json({ message: "Unauthorized" });
      const roleName = current.role?.name || null;
      if (roleName !== "super_admin" && roleName !== "admin" && roleName !== "formateur") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { name, email, password, role: roleId, campus, class: classId, level, profilePicture } = req.body;
      if (!email || !name) return res.status(400).json({ message: "Name and email required" });
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(400).json({ message: "Email already in use" });
      const roleDoc = roleId ? await Role.findById(roleId) : null;
      const newRoleName = roleDoc?.name || null;
      if (roleName === "admin" && newRoleName === "super_admin")
        return res.status(403).json({ message: "Cannot create super_admin" });
      if (roleName === "formateur" && newRoleName !== "etudiant")
        return res.status(403).json({ message: "Formateur can only create etudiant" });
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: password || undefined,
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
        .populate("class", "name")
        .populate("level", "name")
        .select("-password");
      res.status(201).json({ success: true, data: populated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new UserController();
