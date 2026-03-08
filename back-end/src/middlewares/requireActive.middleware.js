const User = require("../models/User");

/**
 * Restrict route to users with status "active".
 * Inactive or pending users get 403 (e.g. no friends / friend requests).
 */
async function requireActive(req, res, next) {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const user = await User.findById(req.user.id).select("status").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.status !== "active") {
      return res.status(403).json({
        message: "Accès réservé aux comptes activés. Activez votre compte pour accéder aux amis.",
      });
    }
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = requireActive;
