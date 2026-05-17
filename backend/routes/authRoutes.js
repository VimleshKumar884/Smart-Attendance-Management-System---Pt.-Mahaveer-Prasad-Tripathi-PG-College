const express = require('express');
const { register, login, getMe, getSecurityQuestion, verifySecurityAnswer, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/get-security-question', getSecurityQuestion);
router.post('/verify-security-answer', verifySecurityAnswer);
router.post('/reset-password', resetPassword);

module.exports = router;
