const router = require("express").Router();
const controller = require("../controllers/requestRole.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

// user 
router.post(
  "/request-role",
  auth,
  requireRole(["connected"]),
  controller.requestRole
);

// admin 
router.post(
  "/role-requests/:requestId/review",
  auth,
  requireRole(["admin"]),
  controller.reviewRequest
);

module.exports = router;
