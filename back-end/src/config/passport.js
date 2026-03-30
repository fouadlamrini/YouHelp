const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const authService = require("../services/auth.service");
require("dotenv").config();

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${API_BASE_URL}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        console.log("[oauth][google] profile received:", {
          id: profile?.id,
          email: profile?.emails?.[0]?.value || null,
          displayName: profile?.displayName || null,
        });
        const email = profile.emails?.[0]?.value;
        if (!email) {
          console.error("[oauth][google] missing email in profile");
          return done(new Error("Google account has no public email"), null);
        }
        const result = await authService.loginOrRegisterOAuth({
          provider: "google",
          providerId: profile.id,
          email,
          name: profile.displayName,
        });
        if (result.error) {
          console.error("[oauth][google] service error:", result.error.message);
          return done(new Error(result.error.message), null);
        }
        console.log("[oauth][google] success:", {
          userId: result.user?._id?.toString?.() || null,
          role: result.roleName,
          provider: result.user?.provider,
        });
        return done(null, {
          user: result.user,
          roleName: result.roleName,
          token: result.token,
        });
      } catch (err) {
        console.error("[oauth][google] strategy exception:", err.message);
        return done(err, null);
      }
    }
    )
  );
} else {
  console.warn("[passport] Google OAuth disabled: missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET");
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${API_BASE_URL}/api/auth/github/callback`,
      scope: ["user:email"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        console.log("[oauth][github] profile received:", {
          id: profile?.id,
          username: profile?.username || null,
          email: profile?.emails?.[0]?.value || null,
        });
        const emailFromGithub = profile.emails?.find((entry) => entry?.value)?.value;
        const fallbackEmail = `${profile.username || "github"}_${profile.id}@users.noreply.github.com`;
        const result = await authService.loginOrRegisterOAuth({
          provider: "github",
          providerId: profile.id,
          email: emailFromGithub || fallbackEmail,
          name: profile.displayName || profile.username || "GitHub user",
        });
        if (result.error) {
          console.error("[oauth][github] service error:", result.error.message);
          return done(new Error(result.error.message), null);
        }
        console.log("[oauth][github] success:", {
          userId: result.user?._id?.toString?.() || null,
          role: result.roleName,
          provider: result.user?.provider,
        });
        return done(null, {
          user: result.user,
          roleName: result.roleName,
          token: result.token,
        });
      } catch (err) {
        console.error("[oauth][github] strategy exception:", err.message);
        return done(err, null);
      }
    }
    )
  );
} else {
  console.warn("[passport] GitHub OAuth disabled: missing GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET");
}

module.exports = passport;
