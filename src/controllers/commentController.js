
const commentService = require('../services/commentService');

// 🔹 Create a new comment or reply
async function addComment(req, res, next) {
   try {
    const { text, parentId, authorName } = req.body;
    const { contentId } = req.params;
    const user = req.user;

    if (!contentId) {
      return res.status(400).json({ message: "Content ID is required" });
    }

    const comment = await commentService.addComment({
      text,
      contentId,
      userId: user.sub,
      authorName: authorName || user.name || user.username || "Anonymous",
      parentId,
    });

    // Emit socket event
    const io = req.app.get("io");
    if (io) io.emit("comment_created", { comment });

    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
}


// 🔹 Edit comment (only by owner)
async function editComment(req, res, next) {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const user = req.user;

    const comment = await commentService.editComment(id, user.sub, text);

    const io = req.app.get("io");
    if (io) io.emit("comment_updated", { comment });

    res.json({ comment });
  } catch (err) {
    console.error("editComment error:", err);
    next(err);
  }
}

// 🔹 Delete comment (only by owner)
async function deleteComment(req, res, next) {
  try {
    const { id } = req.params;
    const user = req.user;

    await commentService.deleteComment(id, user.sub);

    const io = req.app.get("io");
    if (io) io.emit("comment_deleted", { commentId: id });

    res.status(204).end();
  } catch (err) {
    console.error("deleteComment error:", err);
    next(err);
  }
}

// 🔹 Like / Dislike a comment
async function vote(req, res, next) {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'like' or 'dislike'
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const updated = await commentService.vote(id, user.sub, type);

    const io = req.app.get("io");
    if (io) io.emit("comment_updated", { comment: updated });

    res.json({ comment: updated });
  } catch (err) {
    console.error("vote error:", err);
    next(err);
  }
}

// 🔹 Get paginated comments for specific content
async function listComments(req, res, next) {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const sort = req.query.sort || "newest";
    const contentId = req.query.contentId;
    const userId = req.user ? req.user.sub : null;

    const result = await commentService.listComments({
      page,
      limit,
      sort,
      contentId,
      userId
    });

    res.json(result);
  } catch (err) {
    console.error("listComments error:", err);
    next(err);
  }
}

module.exports = {
  addComment,
  editComment,
  deleteComment,
  vote,
  listComments
};
