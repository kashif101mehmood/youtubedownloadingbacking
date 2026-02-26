const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const referralController = require('../controllers/referralController');

router.post('/generate', authMiddleware, referralController.generateReferralLink);

module.exports = router;