const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    body: { type: String },
    image: { type: String, default: "" }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Content", contentSchema);
