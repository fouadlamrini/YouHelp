const User = require("../models/User");

/**
 * Bloque les actions d'écriture (création, réaction, commentaire, partage, etc.)
 * pour les utilisateurs dont le statut n'est pas "active".
 */
async function requireActive(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findById(req.user.id).select("status");
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  if (user.status !== "active") {
    return res.status(403).json({
      message: "Votre compte doit être activé pour effectuer cette action.",
    });
  }
  next();
}

module.exports = requireActive;
