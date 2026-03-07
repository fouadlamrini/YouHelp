const express = require("express");
const passport = require("../config/passport");
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

// ==================== Google OAuth ======================
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
  passport.authenticate("google", { session: false }),
  controller.googleCallback
);
// ===================== GitHub OAuth =====================
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  controller.githubCallback
);
module.exports = router;
