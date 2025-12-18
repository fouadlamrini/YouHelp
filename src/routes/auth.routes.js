const express = require("express");
const passport = require("../config/passport");
const router = express.Router();
const controller = require("../controllers/auth.controller");


router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout", controller.logout);

// Google OAuth
router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/auth/google/callback",
  passport.authenticate("google", { session: false }),
  controller.googleCallback
);

module.exports = router;
