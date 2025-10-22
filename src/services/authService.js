const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userDao = require('../dao/userDao');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const SALT_ROUNDS = 10;

async function register({ name, email, password }) {
  email = email.toLowerCase().trim();
  const existing = await userDao.findByEmail(email);
  if (existing) throw { status: 400, message: 'Email already registered' };
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userDao.createUser({ name, email, passwordHash });
  return { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt };
}

async function login({ email, password }) {
  email = email.toLowerCase().trim();
  const user = await userDao.findByEmail(email);
  if (!user) throw { status: 401, message: 'Invalid credentials' };
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw { status: 401, message: 'Invalid credentials' };
  const payload = { sub: user._id, name: user.name, email: user.email };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { token, user: { id: user._id, name: user.name, email: user.email } };
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { register, login, verifyToken };
