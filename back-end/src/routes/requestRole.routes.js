const express = require("express");
const router = express.Router();
const controller = require("../controllers/requestRole.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

/* ================= USER ================= */

router.post(
  "/request-role",
  auth,
  requireRole(["connected"]),
  controller.requestRole
);

/* ================= ADMIN ================= */

router.get(
  "/role-requests",
  auth,
  requireRole(["admin"]),
  controller.getAllRequests
);


router.put(
  "/role-requests/:requestId/reject",
  auth,
  requireRole(["admin"]),
  controller.rejectRequest
);


router.put(
  "/role-requests/:requestId/accept/formateur",
  auth,
  requireRole(["admin"]),
  controller.acceptAsFormateur
);


router.put(
  "/role-requests/:requestId/accept/etudiant",
  auth,
  requireRole(["admin"]),
  controller.acceptAsEtudiant
);

module.exports = router;
