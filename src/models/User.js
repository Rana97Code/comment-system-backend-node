

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role:     { type: String, enum: ["user", "admin","viewer","audience"], default: "user" },
  isAuthorized: { type: Boolean, default: false } // must be true to comment
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

