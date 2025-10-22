const express = require('express');
const { body, param } = require('express-validator');
const commentController = require('../controllers/commentController');
const { validateRequest } = require('../utils/validators');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', commentController.listComments);

router.post('/',
  requireAuth,
  body('text').isLength({ min: 1 }),
  validateRequest,
  commentController.createComment
);

router.patch('/:id',
  requireAuth,
  param('id').isMongoId(),
  body('text').isLength({ min: 1 }),
  validateRequest,
  commentController.editComment
);

router.delete('/:id',
  requireAuth,
  param('id').isMongoId(),
  validateRequest,
  commentController.deleteComment
);

router.post('/:id/vote',
  requireAuth,
  param('id').isMongoId(),
  body('type').isIn(['like', 'dislike']),
  validateRequest,
  commentController.vote
);

module.exports = router;
