const User = require('../models/User');

// Get current user's credit balance
exports.getCredits = async (req, res) => {
  try {
    const credits = await User.getCredits(req.userId);
    res.json({ credits });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Deduct credits (amount comes from request body)
exports.deductCredits = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const currentCredits = await User.getCredits(req.userId);
    if (currentCredits < amount) {
      return res.status(400).json({ error: 'Insufficient credits' });
    }

    await User.updateCredits(req.userId, -amount);
    res.json({ message: 'Credits deducted', newBalance: currentCredits - amount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};