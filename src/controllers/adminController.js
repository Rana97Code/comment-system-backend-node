const User = require("../models/User");

// ✅ Authorize / Deauthorize user
exports.authorizeUser = async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.isAuthorized = !user.isAuthorized; // toggle
  await user.save();

  res.json({
    message: `User ${user.isAuthorized ? "authorized" : "unauthorized"}`,
    user,
  });
};

// ✅ Change role
exports.updateUserRole = async (req, res) => {
  const { userId, role } = req.body;
  const validRoles = ["user", "viewer", "audience", "admin"];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.role = role;
  await user.save();

  res.json({ message: `Role updated to ${role}`, user });
};
