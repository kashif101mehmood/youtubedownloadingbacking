const pool = require('../config/database');
const VerificationToken = require('../models/VerificationToken');
const User = require('../models/User');
const { sendVerificationEmail } = require('../services/emailService');

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.is_verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Check cooldown (2 minutes = 120 seconds)
    if (user.last_verification_sent_at) {
      const now = new Date();
      const lastSent = new Date(user.last_verification_sent_at);
      const diffSeconds = (now - lastSent) / 1000;
      if (diffSeconds < 120) {
        const waitSeconds = Math.ceil(120 - diffSeconds);
        return res.status(429).json({
          error: `Please wait ${waitSeconds} seconds before requesting another email.`
        });
      }
    }

    // Delete old tokens (optional)
    // ... you may want to delete previous tokens for this user

    const token = await VerificationToken.create(user.id);
    // Update last_verification_sent_at
    await pool.execute(
      'UPDATE users SET last_verification_sent_at = NOW() WHERE id = ?',
      [user.id]
    );
    await sendVerificationEmail(email, token, user.name);

    res.json({ message: 'Verification email resent. Please check your inbox.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};