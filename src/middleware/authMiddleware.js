

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;

async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

async function protect(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.sub || decoded.id).select("-password");

    if (!req.user) return res.status(401).json({ message: "Invalid token" });

    next();
  } catch (err) {
    res.status(401).json({ message: "Not authorized" });
  }
}

async function adminOnly(req, res, next) {
  if (req.user && req.user.role === "admin") return next();
  res.status(403).json({ message: "Admin access required" });
}

module.exports = { requireAuth, protect, adminOnly };
