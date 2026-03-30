const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.controller");
const passport = require("passport");
const auth = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate");
const { registerSchema, loginSchema, changePasswordSchema, completeProfileSchema } = require("../validators/auth.validator");

router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.post("/logout", controller.logout);
router.post("/change-password", auth, validate(changePasswordSchema), controller.changePassword);
router.get("/complete-profile-options", auth, controller.getCompleteProfileOptions);
router.put("/complete-profile", auth, validate(completeProfileSchema), controller.completeProfile);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get("/google/callback", (req, res, next) => {
  console.log("[oauth][google] callback hit");
  passport.authenticate("google", { session: false }, (err, data) => {
    if (err || !data) {
      console.error("[oauth][google] callback failure:", err?.message || "no data");
      const reason = encodeURIComponent(err?.message || "google_oauth_failed");
      return res.redirect(`/api/auth/oauth/failure?reason=${reason}`);
    }
    console.log("[oauth][google] callback success, forwarding to controller");
    req.user = data;
    return controller.oauthSuccess(req, res, next);
  })(req, res, next);
});

router.get("/github", passport.authenticate("github", { scope: ["user:email"], session: false }));
router.get("/github/callback", (req, res, next) => {
  console.log("[oauth][github] callback hit");
  passport.authenticate("github", { session: false }, (err, data) => {
    if (err || !data) {
      console.error("[oauth][github] callback failure:", err?.message || "no data");
      const reason = encodeURIComponent(err?.message || "github_oauth_failed");
      return res.redirect(`/api/auth/oauth/failure?reason=${reason}`);
    }
    console.log("[oauth][github] callback success, forwarding to controller");
    req.user = data;
    return controller.oauthSuccess(req, res, next);
  })(req, res, next);
});
router.get("/oauth/failure", (req, res) => {
  console.error("[oauth] redirected to failure route:", req.query.reason || "unknown_reason");
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const reason = req.query.reason ? `&reason=${encodeURIComponent(req.query.reason)}` : "";
  return res.redirect(`${frontendUrl}/login?oauth=failed${reason}`);
});

module.exports = router;
