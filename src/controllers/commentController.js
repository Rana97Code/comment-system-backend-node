const commentService = require('../services/commentService');

/**
 * we also will emit socket events with req.app.get('io')
 */
async function createComment(req, res, next) {
  try {
    const { text, parentId } = req.body;
    const user = req.user;
    const comment = await commentService.createComment({ text, authorId: user.sub, authorName: user.name, parentId });
    // emit WS
    const io = req.app.get('io');
    if (io) io.emit('comment_created', { comment });
    res.status(201).json({ comment });
  } catch (err) { next(err); }
}

async function editComment(req, res, next) {
  try {
    const id = req.params.id;
    const { text } = req.body;
    const user = req.user;
    const comment = await commentService.editComment(id, user.sub, text);
    const io = req.app.get('io');
    if (io) io.emit('comment_updated', { comment });
    res.json({ comment });
  } catch (err) { next(err); }
}

async function deleteComment(req, res, next) {
  try {
    const id = req.params.id;
    const user = req.user;
    await commentService.deleteComment(id, user.sub);
    const io = req.app.get('io');
    if (io) io.emit('comment_deleted', { commentId: id });
    res.status(204).end();
  } catch (err) { next(err); }
}

async function vote(req, res, next) {
  try {
    const id = req.params.id;
    const { type } = req.body; // 'like'|'dislike'
    const user = req.user;
    const updated = await commentService.vote(id, user.sub, type);
    const io = req.app.get('io');
    if (io) io.emit('comment_updated', { comment: updated });
    res.json({ comment: updated });
  } catch (err) { next(err); }
}

async function listComments(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const sort = req.query.sort || 'newest';
    const userId = req.user ? req.user.sub : null;
    const result = await commentService.listComments({ page, limit, sort, userId });
    res.json(result);
  } catch (err) { next(err); }
}

module.exports = { createComment, editComment, deleteComment, vote, listComments };
