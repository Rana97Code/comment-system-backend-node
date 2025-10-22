const commentDao = require('../dao/commentDao');
const Comment = require('../models/Comment');

/**
 * Create comment (top-level or reply)
 */
async function createComment({ text, authorId, authorName, parentId = null }) {
  if (!text || !text.trim()) throw { status: 400, message: 'Empty comment' };
  const doc = {
    text: text.trim(),
    author: authorId,
    authorName,
    parentId: parentId || null
  };
  const comment = await commentDao.createComment(doc);
  return comment;
}

/**
 * Update comment text (only owner allowed in controller before calling)
 */
async function editComment(id, userId, newText) {
  if (!newText || !newText.trim()) throw { status: 400, message: 'Empty comment' };
  const comment = await commentDao.findById(id);
  if (!comment) throw { status: 404, message: 'Comment not found' };
  if (!comment.author.equals(userId)) throw { status: 403, message: 'Not authorized' };
  return commentDao.updateById(id, { text: newText.trim() });
}

/**
 * Delete comment (owner only)
 * Option: we can also cascade-delete replies or mark as deleted. Here we delete.
 */
async function deleteComment(id, userId) {
  const comment = await commentDao.findById(id);
  if (!comment) throw { status: 404, message: 'Comment not found' };
  if (!comment.author.equals(userId)) throw { status: 403, message: 'Not authorized' };
  return commentDao.deleteById(id);
}

/**
 * Vote: type = 'like'|'dislike'
 * A user can like OR dislike once (toggle & move if switching)
 */
async function vote(id, userId, type) {
  const comment = await commentDao.findById(id);
  if (!comment) throw { status: 404, message: 'Comment not found' };
  const uidStr = userId.toString();

  const liked = comment.likes.find(u => u.toString() === uidStr);
  const disliked = comment.dislikes.find(u => u.toString() === uidStr);

  if (type === 'like') {
    if (liked) {
      // already liked -> remove like (toggle off)
      comment.likes = comment.likes.filter(u => u.toString() !== uidStr);
    } else {
      // add like, remove dislike if exists
      comment.likes.push(userId);
      comment.dislikes = comment.dislikes.filter(u => u.toString() !== uidStr);
    }
  } else if (type === 'dislike') {
    if (disliked) {
      comment.dislikes = comment.dislikes.filter(u => u.toString() !== uidStr);
    } else {
      comment.dislikes.push(userId);
      comment.likes = comment.likes.filter(u => u.toString() !== uidStr);
    }
  } else {
    throw { status: 400, message: 'Invalid vote type' };
  }

  comment.updatedAt = new Date();
  await comment.save();

  // return a shaped comment for the client (with counts and userVote)
  const likesCount = comment.likes.length;
  const dislikesCount = comment.dislikes.length;
  const userVote = comment.likes.find(u => u.toString() === uidStr) ? 'like' : (comment.dislikes.find(u=> u.toString()===uidStr) ? 'dislike' : null);

  return { _id: comment._id, text: comment.text, author: comment.author, authorName: comment.authorName, likes: likesCount, dislikes: dislikesCount, userVote, createdAt: comment.createdAt, updatedAt: comment.updatedAt, parentId: comment.parentId };
}

/**
 * Fetch comments with pagination & sorting
 * Optionally nest replies under their parent in the returned structure (simple approach)
 */
async function listComments({ page = 1, limit = 10, sort = 'newest', userId = null }) {
  const res = await commentDao.queryComments({ page, limit, sort });
  // map to include userVote for each comment
  const comments = res.comments.map(c => {
    const userVote = (() => {
      if (!userId) return null;
      const uIdStr = userId.toString();
      const liked = c.likes && c.likes.some(x => x.toString() === uIdStr);
      const disliked = c.dislikes && c.dislikes.some(x => x.toString() === uIdStr);
      return liked ? 'like' : (disliked ? 'dislike' : null);
    })();
    return { ...c, likes: c.likesCount ?? (c.likes ? c.likes.length : 0), dislikes: c.dislikesCount ?? (c.dislikes ? c.dislikes.length : 0), userVote };
  });

  // Optional: build a parent->children map for replies
  const byId = {};
  comments.forEach(c => { byId[c._id.toString()] = { ...c, replies: [] }; });
  const topLevel = [];
  comments.forEach(c => {
    if (c.parentId) {
      const pid = c.parentId.toString();
      if (byId[pid]) byId[pid].replies.push(byId[c._id.toString()]);
    } else {
      topLevel.push(byId[c._id.toString()]);
    }
  });

  return { comments: topLevel, total: res.total };
}

module.exports = { createComment, editComment, deleteComment, vote, listComments };
