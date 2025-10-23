const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { validateRequest } = require('../utils/validators');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register',
  body('name').isLength({ min: 2 }).trim(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  validateRequest,
  authController.register
);

router.post('/login',
  body('email').isEmail(),
  body('password').exists(),
  validateRequest,
  authController.login
);

router.get('/me', requireAuth, authController.me);

module.exports = router;
