function requireRole(allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

/** Only users with no role (role === null) can pass - for request-role (etudiant) */
function requireNoRole(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.user.role != null) {
    return res.status(403).json({ message: "You already have a role" });
  }
  next();
}

module.exports = { requireRole, requireNoRole };
