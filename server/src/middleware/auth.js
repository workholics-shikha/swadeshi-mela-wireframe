const { verifyToken } = require("../utils/jwt");

function authRequired({ jwtSecret }) {
  return function authMiddleware(req, res, next) {
    try {
      const header = req.headers.authorization || "";
      const [scheme, token] = header.split(" ");
      if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const decoded = verifyToken(token, { secret: jwtSecret });
      req.user = decoded; // { sub, role, email }
      return next();
    } catch {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
}

function requireRole(roles = []) {
  return function roleMiddleware(req, res, next) {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    return next();
  };
}

module.exports = { authRequired, requireRole };
