
const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    body: { type: String },
    image: { type: String },
    likes: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    dislikes: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: [] }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Content", contentSchema);

