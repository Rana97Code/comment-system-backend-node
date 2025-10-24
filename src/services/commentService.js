
const populateReplies = require("../utils/populateReplies");
const Comment = require("../models/Comment");
const UserDao = require("../dao/userDao");
const mongoose = require("mongoose");

// 🔹 Create comment or reply
async function addComment({ text, userId, authorName, contentId, parentId = null }) {
  if (!text || !text.trim()) throw { status: 400, message: "Comment cannot be empty" };
  if (!contentId) throw { status: 400, message: "Content ID is required" };

  const comment = new Comment({
    text: text.trim(),
    userId,
    authorName,
    contentId,
    parentId
  });

  await comment.save();

  // if it's a reply, link it to parent comment
  if (parentId) {
    await Comment.findByIdAndUpdate(parentId, { $push: { replies: comment._id } });
  }

  return comment;
}




// 🔹 Edit comment (only owner)
async function editComment(id, userId, newText) {
  if (!newText || !newText.trim()) throw { status: 400, message: "Empty comment" };
  const comment = await Comment.findById(id);
  if (!comment) throw { status: 404, message: "Comment not found" };
  if (comment.userId.toString() !== userId.toString()) throw { status: 403, message: "Not authorized" };

  comment.text = newText.trim();
  comment.updatedAt = new Date();
  await comment.save();
  return comment;
}

// 🔹 Delete comment (only owner)
// async function deleteComment(id, userId) {
//   const comment = await Comment.findById(id);
//   if (!comment) throw { status: 404, message: "Comment not found" };
//   if (comment.userId.toString() !== userId.toString()) throw { status: 403, message: "Not authorized" };

//   // if it’s a reply, remove it from parent's replies list
//   if (comment.parentId) {
//     await Comment.findByIdAndUpdate(comment.parentId, { $pull: { replies: comment._id } });
//   }

//   await comment.deleteOne();
//   return true;
// }

// 🔹 Delete comment (only owner or authorized user)
async function deleteComment(id, userId) {
  const user = await UserDao.findById(userId);
  if (!user || !user._id) {
    throw { status: 401, message: "User not authenticated" };
  }

  const comment = await Comment.findById(id);
  if (!comment) throw { status: 404, message: "Comment not found" };

  const isOwner = comment.userId?.toString?.() === user._id?.toString?.();
  const isAdmin = user.role === "admin";
  const isAuthorized = user.isAuthorized === true;

  // ❌ Reject if not owner, not admin, and not authorized
  if (!isAdmin && !isAuthorized) {
    throw { status: 403, message: "Not authorized to delete this comment" };
  }

  // If it's a reply, remove it from parent's replies array
  if (comment.parentId) {
    await Comment.findByIdAndUpdate(comment.parentId, { $pull: { replies: comment._id } });
  }

  await comment.deleteOne();

  return { success: true, message: "Comment deleted successfully" };
}




// 🔹 Like / Dislike system
async function vote(id, userId, type) {
  const comment = await Comment.findById(id);
  if (!comment) throw { status: 404, message: "Comment not found" };

  const uidStr = userId.toString();
  const alreadyLiked = comment.likes.some(u => u.toString() === uidStr);
  const alreadyDisliked = comment.dislikes.some(u => u.toString() === uidStr);

  if (type === "like") {
    if (alreadyLiked) {
      comment.likes = comment.likes.filter(u => u.toString() !== uidStr);
    } else {
      comment.likes.push(userId);
      comment.dislikes = comment.dislikes.filter(u => u.toString() !== uidStr);
    }
  } else if (type === "dislike") {
    if (alreadyDisliked) {
      comment.dislikes = comment.dislikes.filter(u => u.toString() !== uidStr);
    } else {
      comment.dislikes.push(userId);
      comment.likes = comment.likes.filter(u => u.toString() !== uidStr);
    }
  } else {
    throw { status: 400, message: "Invalid vote type" };
  }

  await comment.save();

  const likesCount = comment.likes.length;
  const dislikesCount = comment.dislikes.length;
  const userVote = alreadyLiked
    ? null
    : alreadyDisliked
    ? null
    : type;

  return {
    _id: comment._id,
    text: comment.text,
    authorName: comment.authorName,
    contentId: comment.contentId,
    likes: likesCount,
    dislikes: dislikesCount,
    userVote,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    parentId: comment.parentId
  };
}

// 🔹 List comments for a specific content with pagination


async function listComments({
  contentId,
  userId,
  page = 1,
  limit = 10,
  sort = "newest",
}) {
  if (!contentId) throw { status: 400, message: "contentId is required" };

  const skip = (page - 1) * limit;

  // ✅ Improved sorting options
  let sortOption = { createdAt: -1 }; // default newest
  if (sort === "oldest") sortOption = { createdAt: 1 };
  else if (sort === "most_liked") sortOption = { likesCount: -1 };
  else if (sort === "most_disliked") sortOption = { dislikesCount: -1 };

  // ✅ Precompute like/dislike counts in aggregation
  const baseQuery = [
    { $match: { contentId: new mongoose.Types.ObjectId(contentId), parentId: null } },
    {
      $addFields: {
        likesCount: { $size: { $ifNull: ["$likes", []] } },
        dislikesCount: { $size: { $ifNull: ["$dislikes", []] } },
      },
    },
    { $sort: sortOption },
    { $skip: skip },
    { $limit: Number(limit) },
  ];

  const comments = await Comment.aggregate(baseQuery);

  // Convert each aggregated comment back to Mongoose document
  const hydrated = await Comment.populate(comments, { path: "replies" });

  // Recursively populate all replies
  for (let c of hydrated) {
    await populateReplies(c);
  }

  // ✅ Normalizer (no change)
  const normalizeComment = (c) => {
    const uStr = userId ? userId.toString() : "";

    const userVote = userId
      ? c.likes?.some((x) => x.toString() === uStr)
        ? "like"
        : c.dislikes?.some((x) => x.toString() === uStr)
        ? "dislike"
        : null
      : null;

    return {
      _id: c._id,
      contentId: c.contentId,
      userId: c.userId,
      authorName: c.authorName,
      text: c.text,
      parentId: c.parentId,
      likes: c.likes?.length || 0,
      dislikes: c.dislikes?.length || 0,
      userVote,
      replies: (c.replies || []).map((r) => normalizeComment(r)),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  };

  const enriched = hydrated.map((c) =>
    normalizeComment(c._id ? c : new Comment(c).toObject())
  );

  const total = await Comment.countDocuments({ contentId, parentId: null });

  return { comments: enriched, total };
}



module.exports = {
  addComment,
  editComment,
  deleteComment,
  vote,
  listComments
};
