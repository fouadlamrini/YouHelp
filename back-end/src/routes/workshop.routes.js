const express = require("express");
const router = express.Router();
const controller = require("../controllers/workshop.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

router.get("/", controller.getAllWorkshops);
router.post("/", auth, requireRole(["super_admin", "admin", "formateur"]), controller.createWorkshop);
router.post("/:workshopId/request", auth, requireRole(["super_admin", "admin", "formateur", "etudiant"]), controller.requestWorkshop);
router.get("/my-requests", auth, controller.getMyRequests);

module.exports = router;
