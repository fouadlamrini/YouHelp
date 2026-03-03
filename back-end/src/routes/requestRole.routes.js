const express = require("express");
const router = express.Router();
const controller = require("../controllers/requestRole.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole, requireNoRole } = require("../middlewares/role.middleware");

/* ================= USER (only role=null can send request = demande etudiant) ================= */

router.post(
  "/request-role",
  auth,
  requireNoRole,
  controller.requestRole
);

/* ================= ROLE REQUESTS: super_admin all, admin same campus, formateur same campus+class ================= */

router.get(
  "/role-requests",
  auth,
  requireRole(["super_admin", "admin", "formateur"]),
  controller.getAllRequests
);

router.put(
  "/role-requests/:requestId/reject",
  auth,
  requireRole(["super_admin", "admin", "formateur"]),
  controller.rejectRequest
);

router.put(
  "/role-requests/:requestId/accept/formateur",
  auth,
  requireRole(["super_admin", "admin"]),
  controller.acceptAsFormateur
);

router.put(
  "/role-requests/:requestId/accept/etudiant",
  auth,
  requireRole(["super_admin", "admin", "formateur"]),
  controller.acceptAsEtudiant
);

module.exports = router;
