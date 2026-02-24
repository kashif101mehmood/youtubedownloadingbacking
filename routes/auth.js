const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verificationController = require('../controllers/verificationController');
const { validate, registerValidation, loginValidation } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

// Email/Password routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authLimiter, authController.login);
router.get('/verify-email', verificationController.verifyEmail);
router.post('/resend-verification', verificationController.resendVerification);

// Google OAuth
router.post('/google', authController.googleAuth);

// Password reset
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;