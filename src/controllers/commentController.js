// const commentService = require('../services/commentService');

// /**
//  * we also will emit socket events with req.app.get('io')
//  */
// async function createComment(req, res, next) {
//   try {
//     const { text, parentId } = req.body;
//     const user = req.user;
//     const comment = await commentService.createComment({ text, authorId: user.sub, authorName: user.name, parentId });
//     // emit WS
//     const io = req.app.get('io');
//     if (io) io.emit('comment_created', { comment });
//     res.status(201).json({ comment });
//   } catch (err) { next(err); }
// }

// async function editComment(req, res, next) {
//   try {
//     const id = req.params.id;
//     const { text } = req.body;
//     const user = req.user;
//     const comment = await commentService.editComment(id, user.sub, text);
//     const io = req.app.get('io');
//     if (io) io.emit('comment_updated', { comment });
//     res.json({ comment });
//   } catch (err) { next(err); }
// }

// async function deleteComment(req, res, next) {
//   try {
//     const id = req.params.id;
//     const user = req.user;
//     await commentService.deleteComment(id, user.sub);
//     const io = req.app.get('io');
//     if (io) io.emit('comment_deleted', { commentId: id });
//     res.status(204).end();
//   } catch (err) { next(err); }
// }

// async function vote(req, res, next) {
//   try {
//     const id = req.params.id;
//     const { type } = req.body; // 'like'|'dislike'
//     const user = req.user;
//     const updated = await commentService.vote(id, user.sub, type);
//     const io = req.app.get('io');
//     if (io) io.emit('comment_updated', { comment: updated });
//     res.json({ comment: updated });
//   } catch (err) { next(err); }
// }

// async function listComments(req, res, next) {
//   try {
//     const page = parseInt(req.query.page || '1', 10);
//     const limit = parseInt(req.query.limit || '10', 10);
//     const sort = req.query.sort || 'newest';
//     const userId = req.user ? req.user.sub : null;
//     const result = await commentService.listComments({ page, limit, sort, userId });
//     res.json(result);
//   } catch (err) { next(err); }
// }

// module.exports = { createComment, editComment, deleteComment, vote, listComments };




const Comment = require("../models/Comment");
const Content = require("../models/Content");
const { canUserEditOrDelete, hasUserLiked, hasUserDisliked } = require("../services/commentService");

async function addComment(req, res) {
  try {
    const { contentId, text, parentId } = req.body;
    const user = req.user;

    if (!user.isAuthorized)
      return res.status(403).json({ message: "User not authorized to comment" });

    const comment = await Comment.create({
      contentId,
      userId: user._id,
      authorName: user.username,
      text,
      parentId: parentId || null,
    });

    // If it's a reply, add it to the parent's replies array
    if (parentId) {
      await Comment.findByIdAndUpdate(parentId, {
        $push: { replies: comment._id },
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


async function editComment(req, res) {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (!canUserEditOrDelete(req.user, comment))
      return res.status(403).json({ message: "You can only edit your own comments" });

    comment.text = req.body.text;
    await comment.save();

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function deleteComment(req, res) {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (!canUserEditOrDelete(req.user, comment))
      return res.status(403).json({ message: "You can only delete your own comments" });

    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function likeComment(req, res) {
  try {
    const comment = await Comment.findById(req.params.id);
    const userId = req.user._id;

    if (hasUserLiked(comment, userId))
      return res.status(400).json({ message: "You already liked this comment" });

    comment.likes.push(userId);
    comment.dislikes = comment.dislikes.filter(u => u.toString() !== userId.toString());

    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function dislikeComment(req, res) {
  try {
    const comment = await Comment.findById(req.params.id);
    const userId = req.user._id;

    if (hasUserDisliked(comment, userId))
      return res.status(400).json({ message: "You already disliked this comment" });

    comment.dislikes.push(userId);
    comment.likes = comment.likes.filter(u => u.toString() !== userId.toString());

    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addComment,
  editComment,
  deleteComment,
  likeComment,
  dislikeComment,
};