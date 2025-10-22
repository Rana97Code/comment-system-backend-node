const User = require('../models/User');

async function createUser(payload) {
  const user = new User(payload);
  return user.save();
}

async function findByEmail(email) {
  return User.findOne({ email }).lean();
}

async function findById(id) {
  return User.findById(id).lean();
}

module.exports = { createUser, findByEmail, findById };
