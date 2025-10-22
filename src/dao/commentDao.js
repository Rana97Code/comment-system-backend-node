const Comment = require('../models/Comment');

/**
 * Create comment doc
 */
async function createComment(doc) {
  const c = new Comment(doc);
  return c.save();
}

async function findById(id) {
  return Comment.findById(id).exec();
}

/**
 * Delete comment
 */
async function deleteById(id) {
  return Comment.findByIdAndDelete(id).exec();
}

/**
 * Update comment text/updatedAt
 */
async function updateById(id, update) {
  update.updatedAt = new Date();
  return Comment.findByIdAndUpdate(id, update, { new: true }).exec();
}

/**
 * Query list with pagination and sorting
 * sort: 'newest' | 'most_liked' | 'most_disliked'
 */
async function queryComments({ page = 1, limit = 10, sort = 'newest' }) {
  const skip = (page - 1) * limit;
  let sortObj = { createdAt: -1 };

  if (sort === 'most_liked') sortObj = { likesCount: -1, createdAt: -1 };
  if (sort === 'most_disliked') sortObj = { dislikesCount: -1, createdAt: -1 };

  // aggregate to compute counts and optionally shape replies
  const pipeline = [
    // top-level comments and replies both included; client can request nesting if needed
    {
      $addFields: {
        likesCount: { $size: { $ifNull: ['$likes', []] } },
        dislikesCount: { $size: { $ifNull: ['$dislikes', []] } }
      }
    },
    { $sort: sortObj },
    { $skip: skip },
    { $limit: limit },
    // populate authorName and parentId fields
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'authorObj'
      }
    },
    { $unwind: { path: '$authorObj', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        text: 1, author: 1, authorName: { $ifNull: ['$authorName', '$authorObj.name'] }, parentId: 1,
        likesCount: 1, dislikesCount: 1, likes: 1, dislikes: 1, createdAt: 1, updatedAt:1
      }
    }
  ];

  const comments = await Comment.aggregate(pipeline).exec();
  const total = await Comment.countDocuments().exec();

  return { comments, total };
}

module.exports = { createComment, findById, deleteById, updateById, queryComments };
