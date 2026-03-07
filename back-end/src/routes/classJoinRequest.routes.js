const express = require("express");
const router = express.Router();
const controller = require("../controllers/classJoinRequest.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate");
const { requestJoinSchema } = require("../validators/classJoinRequest.validator");

router.post("/", auth, requireRole(["admin", "formateur", "etudiant"]), validate(requestJoinSchema), controller.create);
router.get("/my-class", auth, requireRole(["formateur"]), controller.getRequestsForMyClass);
router.put("/:id/accept", auth, requireRole(["formateur"]), controller.accept);
router.put("/:id/reject", auth, requireRole(["formateur"]), controller.reject);

module.exports = router;
