const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../models/User");
const userDao = require('../dao/userDao');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const SALT_ROUNDS = 10;

async function register(data) {
  try {
  let { name, email, password } = data;

    email = email.toLowerCase().trim();


    // 1️⃣ Check for existing user
    const existing = await userDao.findByEmail(email);
    if (existing) throw { status: 400, message: "Email already registered" };

   
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 3️⃣ Create new user with default role & authorization flag
    const user = await userDao.createUser({
      name,
      email,
      passwordHash,
      role: "user", 
      isAuthorized: false, 
    });

    const payload = { sub: user._id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAuthorized: user.isAuthorized,
        createdAt: user.createdAt,
      },
    };
  } catch (err) {
    throw err.status ? err : { status: 500, message: err.message || "Registration failed" };
  }
}


async function login({ email, password }) {
  email = email.toLowerCase().trim();
  const user = await userDao.findByEmail(email);
  if (!user) throw { status: 401, message: 'Invalid credentials' };
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw { status: 401, message: 'Invalid credentials' };

  // include role and isAuthorized in token payload
  const payload = { 
    sub: user._id, 
    name: user.name, 
    email: user.email, 
    role: user.role, 
    isAuthorized: user.isAuthorized 
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { 
    token, 
    user: { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      isAuthorized: user.isAuthorized 
    } 
  };
}
async function getNonAdminUsers() {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password") 
      .sort({ createdAt: -1 }); 
    return users;
  } catch (err) {
    throw new Error("Error fetching non-admin users: " + err.message);
  }
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { register, login, getNonAdminUsers, verifyToken };
