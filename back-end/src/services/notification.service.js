const User = require("../models/User");
const Role = require("../models/Role");
const Notification = require("../models/Notification");

function refId(ref) {
  if (!ref) return null;
  return (ref._id || ref).toString();
}

/**
 * Recipients when a new user completes profile (pending):
 * - super_admin (all)
 * - admin (same campus)
 * - formateur (same campus, class, level)
 */
async function getRecipientsForNewPendingUser(newUserDoc) {
  const campusId = refId(newUserDoc.campus);
  const classId = refId(newUserDoc.class);
  const levelId = refId(newUserDoc.level);

  const superAdminRole = await Role.findOne({ name: "super_admin" });
  const adminRole = await Role.findOne({ name: "admin" });
  const formateurRole = await Role.findOne({ name: "formateur" });

  const recipientIds = new Set();

  if (superAdminRole) {
    const superAdmins = await User.find({ role: superAdminRole._id }).select("_id");
    superAdmins.forEach((u) => recipientIds.add(u._id.toString()));
  }
  if (adminRole && campusId) {
    const admins = await User.find({ role: adminRole._id, campus: campusId }).select("_id");
    admins.forEach((u) => recipientIds.add(u._id.toString()));
  }
  if (formateurRole && campusId && classId && levelId) {
    const formateurs = await User.find({
      role: formateurRole._id,
      campus: campusId,
      class: classId,
      level: levelId,
    }).select("_id");
    formateurs.forEach((u) => recipientIds.add(u._id.toString()));
  }

  return Array.from(recipientIds);
}

/**
 * Recipients when a user is activated or refused (by actor).
 * Always includes the student (relatedUser).
 * Plus: according to actor role -> notify admin/super_admin/formateur.
 */
async function getRecipientsForUserStatusChange(actorDoc, studentDoc) {
  const actorRoleName = actorDoc.role?.name || null;
  const studentId = studentDoc._id.toString();
  const campusId = refId(studentDoc.campus);
  const classId = refId(studentDoc.class);
  const levelId = refId(studentDoc.level);

  const recipientIds = new Set();
  recipientIds.add(studentId);

  const superAdminRole = await Role.findOne({ name: "super_admin" });
  const adminRole = await Role.findOne({ name: "admin" });
  const formateurRole = await Role.findOne({ name: "formateur" });

  if (actorRoleName === "formateur") {
    if (superAdminRole) {
      const superAdmins = await User.find({ role: superAdminRole._id }).select("_id");
      superAdmins.forEach((u) => recipientIds.add(u._id.toString()));
    }
    if (adminRole && campusId) {
      const admins = await User.find({ role: adminRole._id, campus: campusId }).select("_id");
      admins.forEach((u) => recipientIds.add(u._id.toString()));
    }
  } else if (actorRoleName === "admin") {
    if (superAdminRole) {
      const superAdmins = await User.find({ role: superAdminRole._id }).select("_id");
      superAdmins.forEach((u) => recipientIds.add(u._id.toString()));
    }
    if (formateurRole && campusId && classId && levelId) {
      const formateurs = await User.find({
        role: formateurRole._id,
        campus: campusId,
        class: classId,
        level: levelId,
      }).select("_id");
      formateurs.forEach((u) => recipientIds.add(u._id.toString()));
    }
  } else if (actorRoleName === "super_admin") {
    if (adminRole && campusId) {
      const admins = await User.find({ role: adminRole._id, campus: campusId }).select("_id");
      admins.forEach((u) => recipientIds.add(u._id.toString()));
    }
    if (formateurRole && campusId && classId && levelId) {
      const formateurs = await User.find({
        role: formateurRole._id,
        campus: campusId,
        class: classId,
        level: levelId,
      }).select("_id");
      formateurs.forEach((u) => recipientIds.add(u._id.toString()));
    }
  }

  return Array.from(recipientIds);
}

async function notifyNewRegistration(newUserDoc) {
  const recipientIds = await getRecipientsForNewPendingUser(newUserDoc);
  const message =
    "Un nouvel utilisateur en attente. Consultez la liste des utilisateurs pour l'activer ou le refuser.";
  const notifications = recipientIds.map((recipientId) => ({
    recipient: recipientId,
    type: "new_registration",
    message,
    relatedUser: newUserDoc._id,
    link: "/users",
  }));
  if (notifications.length) await Notification.insertMany(notifications);
}

async function notifyUserActivated(actorDoc, studentDoc) {
  const recipientIds = await getRecipientsForUserStatusChange(actorDoc, studentDoc);
  const actorName = actorDoc.name || "Un formateur";
  const studentName = studentDoc.name || "l'étudiant";
  const actorRoleName = actorDoc.role?.name || null;

  const notifications = [];
  for (const recipientId of recipientIds) {
    const isStudent = recipientId === studentDoc._id.toString();
    const message = isStudent
      ? `Vous avez été activé par ${actorName}.`
      : actorRoleName === "formateur"
        ? `Le formateur ${actorName} a activé l'étudiant ${studentName}.`
        : actorRoleName === "admin"
          ? `L'administrateur ${actorName} a activé l'étudiant ${studentName}.`
          : `Le super admin a activé l'étudiant ${studentName}.`;
    notifications.push({
      recipient: recipientId,
      actor: actorDoc._id,
      type: "user_activated",
      message,
      relatedUser: studentDoc._id,
      link: "/users",
    });
  }
  if (notifications.length) await Notification.insertMany(notifications);
}

async function notifyUserRefused(actorDoc, studentDoc) {
  const recipientIds = await getRecipientsForUserStatusChange(actorDoc, studentDoc);
  const actorName = actorDoc.name || "Un responsable";
  const studentName = studentDoc.name || "l'étudiant";
  const actorRoleName = actorDoc.role?.name || null;

  const notifications = [];
  for (const recipientId of recipientIds) {
    const isStudent = recipientId === studentDoc._id.toString();
    const message = isStudent
      ? `Votre compte a été refusé.`
      : actorRoleName === "formateur"
        ? `Le formateur ${actorName} a refusé l'étudiant ${studentName}.`
        : actorRoleName === "admin"
          ? `L'administrateur ${actorName} a refusé l'étudiant ${studentName}.`
          : `Le super admin a refusé l'étudiant ${studentName}.`;
    notifications.push({
      recipient: recipientId,
      actor: actorDoc._id,
      type: "user_refused",
      message,
      relatedUser: studentDoc._id,
      link: "/users",
    });
  }
  if (notifications.length) await Notification.insertMany(notifications);
}

module.exports = {
  notifyNewRegistration,
  notifyUserActivated,
  notifyUserRefused,
};
