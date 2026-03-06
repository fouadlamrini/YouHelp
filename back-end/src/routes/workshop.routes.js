const express = require("express");
const router = express.Router();
const controller = require("../controllers/workshop.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

router.get("/", controller.getAllWorkshops);
router.post("/", auth, requireRole(["super_admin", "admin", "formateur"]), controller.createWorkshop);
router.post("/:workshopId/request", auth, requireRole(["super_admin", "admin", "formateur", "etudiant"]), controller.requestWorkshop);
router.get("/my-requests", auth, controller.getMyRequests);

router.post("/request-from-post", auth, requireRole(["etudiant"]), controller.requestFromPost);
router.get("/requests/pending", auth, requireRole(["formateur"]), controller.getPendingForFormateur);
router.patch("/requests/:id/accept", auth, requireRole(["formateur"]), controller.acceptRequest);
router.patch("/requests/:id/reject", auth, requireRole(["formateur"]), controller.rejectRequest);
router.get("/my-workshops", auth, controller.getMyWorkshops);

module.exports = router;
