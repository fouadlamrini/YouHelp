const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");
const Role = require("../models/Role");
require("dotenv").config();

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

async function pickRoleAndStatusForNewUser() {
  const userCount = await User.countDocuments();

  if (userCount === 0) {
    const superAdminRole = await Role.findOne({ name: "super_admin" });
    if (!superAdminRole) {
      throw new Error("super_admin role not found");
    }
    return { roleId: superAdminRole._id, status: "active", completeProfile: true };
  }

  const defaultRole = await Role.findOne({ name: "etudiant" });
  return { roleId: defaultRole ? defaultRole._id : null, status: undefined, completeProfile: false };
}

/* ===================== GOOGLE ===================== */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const rawEmail = profile.emails && profile.emails[0]?.value;
        const email = normalizeEmail(rawEmail);

        let user = email ? await User.findOne({ email }) : null;

        if (!user) {
          const { roleId, status, completeProfile } = await pickRoleAndStatusForNewUser();
          const data = {
            name: profile.displayName,
            email: email || null,
            provider: "google",
            googleId: profile.id,
          };
          if (roleId) data.role = roleId;
          if (status) data.status = status;
          if (completeProfile) data.completeProfile = true;

          user = await User.create(data);
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

/* ===================== GITHUB ===================== */
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/github/callback",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const rawEmail = profile.emails && profile.emails[0]?.value;
        const email = normalizeEmail(rawEmail);

        let user = null;
        if (email) {
          user = await User.findOne({ email });
        }

        if (!user) {
          user = await User.findOne({ githubId: profile.id });
        }

        if (!user) {
          const { roleId, status, completeProfile } = await pickRoleAndStatusForNewUser();
          const data = {
            name: profile.username,
            email: email || null,
            provider: "github",
            githubId: profile.id,
          };
          if (roleId) data.role = roleId;
          if (status) data.status = status;
          if (completeProfile) data.completeProfile = true;

          user = await User.create(data);
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

module.exports = passport;
