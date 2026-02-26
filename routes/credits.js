const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const creditController = require('../controllers/creditController');

router.get('/', authMiddleware, creditController.getCredits);
router.post('/deduct', authMiddleware, creditController.deductCredits);

module.exports = router;