const express = require("express");
const router = express.Router();
const controller = require("../controllers/workshop.controller");
const auth = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate");
const { createWorkshopSchema, requestFromPostSchema, acceptRequestSchema } = require("../validators/workshop.validator");

router.get("/", controller.getAllWorkshops);
router.post("/", auth, requireRole(["super_admin", "admin", "formateur"]), validate(createWorkshopSchema), controller.createWorkshop);
router.post("/:workshopId/request", auth, requireRole(["super_admin", "admin", "formateur", "etudiant"]), controller.requestWorkshop);
router.get("/my-requests", auth, controller.getMyRequests);

router.post("/request-from-post", auth, requireRole(["etudiant"]), validate(requestFromPostSchema), controller.requestFromPost);
router.get("/requests/pending", auth, requireRole(["formateur"]), controller.getPendingForFormateur);
router.patch("/requests/:id/accept", auth, requireRole(["formateur"]), validate(acceptRequestSchema), controller.acceptRequest);
router.patch("/requests/:id/reject", auth, requireRole(["formateur"]), controller.rejectRequest);
router.get("/my-workshops", auth, controller.getMyWorkshops);

module.exports = router;
