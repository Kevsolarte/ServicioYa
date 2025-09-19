const jwt = require("jsonwebtoken");
const env = require("../config/env");

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = payload; // { sub, role }
    next();
  } catch (_e) {
    return res.status(401).json({ message: "Token inválido" });
  }
}

function merchantOnly(req, res, next) {
  if (req.user?.role !== "merchant" && req.user?.role !== "admin") {
    return res.status(403).json({ message: "Solo merchant" });
  }
  next();
}

module.exports = { authRequired, merchantOnly };
