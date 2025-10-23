// const express = require('express');
// const { body, param } = require('express-validator');
// const commentController = require('../controllers/commentController');
// const { validateRequest } = require('../utils/validators');
// const { requireAuth } = require('../middleware/authMiddleware');

// const router = express.Router();

// router.get('/', commentController.listComments);

// router.post('/',
//   requireAuth,
//   body('text').isLength({ min: 1 }),
//   validateRequest,
//   commentController.createComment
// );

// router.patch('/:id',
//   requireAuth,
//   param('id').isMongoId(),
//   body('text').isLength({ min: 1 }),
//   validateRequest,
//   commentController.editComment
// );

// router.delete('/:id',
//   requireAuth,
//   param('id').isMongoId(),
//   validateRequest,
//   commentController.deleteComment
// );

// router.post('/:id/vote',
//   requireAuth,
//   param('id').isMongoId(),
//   body('type').isIn(['like', 'dislike']),
//   validateRequest,
//   commentController.vote
// );

// module.exports = router;


const express = require("express");
const {
  addComment,
  editComment,  
  deleteComment,
  likeComment,
  dislikeComment
} = require("../controllers/commentController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/", protect, addComment);
router.put("/:id", protect, editComment);
router.delete("/:id", protect, deleteComment);
router.post("/:id/like", protect, likeComment);
router.post("/:id/dislike", protect, dislikeComment);

module.exports = router;

