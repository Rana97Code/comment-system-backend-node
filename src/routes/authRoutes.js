const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { validateRequest } = require('../utils/validators');
const { requireAuth } = require('../middleware/authMiddleware');

const { authorizeUser,updateUserRole } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");



const router = express.Router();
router.get("/users", protect, adminOnly, authController.getNonAdminUsers);
router.post("/update-role",protect, adminOnly, updateUserRole);
router.post("/authorize", protect, adminOnly, authorizeUser);


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
