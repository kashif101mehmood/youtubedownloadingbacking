const VerificationToken = require('../models/VerificationToken');
const User = require('../models/User');
const { sendVerificationEmail } = require('../services/emailService');

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const tokenData = await VerificationToken.findByToken(token);
    if (!tokenData) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    await User.verify(tokenData.user_id);
    await VerificationToken.delete(token);

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

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

    const token = await VerificationToken.create(user.id);
    await sendVerificationEmail(email, token);

    res.json({ message: 'Verification email resent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};