const router = require("express").Router();
const controller = require("../controllers/RoleRequestController");
const auth = require("../middlewares/auth");
const { requireRole } = require("../middlewares/requireRole");

// user connected
router.post(
  "/request-role",
  auth,
  requireRole(["connected"]),
  controller.requestRole
);

// admin
router.get(
  "/role-requests",
  auth,
  requireRole(["admin"]),
  controller.getAllRequests
);

router.post(
  "/role-requests/:requestId/review",
  auth,
  requireRole(["admin"]),
  controller.reviewRequest
);

module.exports = router;
