const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const downloadController = require('../controllers/downloadController');

// All routes require authentication
router.post('/initiate', authMiddleware, downloadController.initiateDownload);
router.get('/key', authMiddleware, downloadController.getKey); // optional

module.exports = router;