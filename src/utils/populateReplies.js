// utils/populateReplies.js
const Comment = require("../models/Comment");

async function populateReplies(doc, maxDepth = 5, currentDepth = 0) {
  if (!doc || currentDepth >= maxDepth) return doc;

  // ✅ Use Comment.populate instead of doc.populate
  const populated = await Comment.populate(doc, { path: "replies" });

  if (!populated.replies || populated.replies.length === 0) return populated;

  // recursively populate each reply
  const populatedReplies = [];
  for (const reply of populated.replies) {
    const populatedReply = await populateReplies(reply, maxDepth, currentDepth + 1);
    populatedReplies.push(populatedReply);
  }

  populated.replies = populatedReplies;
  return populated;
}

module.exports = populateReplies;
