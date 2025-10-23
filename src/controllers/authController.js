const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const user = await authService.register({ name, email, password });
    res.status(201).json({ user });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (err) { next(err); }
}

async function me(req, res, next) {
  try {
    // req.user set by authMiddleware
    const user = req.user;
    res.json({ id: user.sub, name: user.name, email: user.email, role: user.role });
  } catch (err) { next(err); }
}

async function getNonAdminUsers(req, res) {
  try {
    const users = await authService.getNonAdminUsers();
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ getNonAdminUsers error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch users" });
  }
}

module.exports = { register, login, getNonAdminUsers, me };
