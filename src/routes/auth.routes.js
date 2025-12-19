const express = require("express");
const passport = require("../config/passport");
const router = express.Router();
const controller = require("../controllers/auth.controller");


router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout", controller.logout);

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
