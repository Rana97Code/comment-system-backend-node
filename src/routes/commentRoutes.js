const express = require('express');
const { body, param } = require('express-validator');
const commentController = require('../controllers/commentController');
const { validateRequest } = require('../utils/validators');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ Get comments (optionally filter by content)
router.get('/', commentController.listComments);

// ✅ Create a comment for a specific content
router.post(
  '/:contentId',
  requireAuth,
  param('contentId').isMongoId(),
  body('text').isLength({ min: 1 }).withMessage('Text is required'),
  validateRequest,
  commentController.addComment
);

// ✅ Edit an existing comment
router.patch(
  '/:id',
  requireAuth,
  param('id').isMongoId(),
  body('text').isLength({ min: 1 }).withMessage('Text is required'),
  validateRequest,
  commentController.editComment
);

// ✅ Delete a comment
router.delete(
  '/:id',
  requireAuth,
  param('id').isMongoId(),
  validateRequest,
  commentController.deleteComment
);

// ✅ Like / Dislike comment
router.post(
  '/:id/vote',
  requireAuth,
  param('id').isMongoId(),
  body('type').isIn(['like', 'dislike']),
  validateRequest,
  commentController.vote
);

module.exports = router;
