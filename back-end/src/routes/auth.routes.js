const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.controller");
const auth = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate");
const { registerSchema, loginSchema, changePasswordSchema, completeProfileSchema } = require("../validators/auth.validator");

router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.post("/logout", controller.logout);
router.post("/change-password", auth, validate(changePasswordSchema), controller.changePassword);
router.get("/complete-profile-options", auth, controller.getCompleteProfileOptions);
router.put("/complete-profile", auth, validate(completeProfileSchema), controller.completeProfile);

module.exports = router;
