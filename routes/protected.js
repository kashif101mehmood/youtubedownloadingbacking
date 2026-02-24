const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.get('/profile', authMiddleware, async (req, res) => {
  // You can fetch user details from DB using req.userId if needed
  res.json({ message: 'This is a protected route', userId: req.userId });
});

module.exports = router;