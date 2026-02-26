const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database'); // for linking google_id to existing user
const User = require('../models/User');
const VerificationToken = require('../models/VerificationToken');
const PasswordResetToken = require('../models/PasswordResetToken');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const { verifyGoogleToken } = require('../services/oauthService');

// Register with email/password
exports.register = async (req, res) => {
  try {
    const { email, password, name, refCode } = req.body; // add refCode
    // const { email, password, name } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Inside register, after creating user

    // ... existing validation ...

    // Create user (with referredBy = null initially)
    let referredBy = null;
    if (refCode) {
      const referrer = await User.findByReferralCode(refCode);
      if (referrer) {
        referredBy = referrer.id;
      }
    }

    const userId = await User.create({
      email,
      password: hashedPassword,
      name,
      isVerified: false,
      referredBy: referredBy
    });
    await User.generateReferralCode(userId);

    // If there is a valid referrer, give them 100 credits
    if (referredBy) {
      await User.updateCredits(referredBy, 100);
    }

    // ... rest (send verification email)

    const token = await VerificationToken.create(userId);
    await sendVerificationEmail(email, token);

    res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Login with email/password
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_verified) {
      return res.status(401).json({ error: 'Please verify your email first' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Google Sign-In
exports.googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    const payload = await verifyGoogleToken(idToken);

    let user = await User.findByGoogleId(payload.googleId);
    if (!user) {
      user = await User.findByEmail(payload.email);
      if (user) {
        // Link google_id to existing user
        await pool.execute('UPDATE users SET google_id = ? WHERE id = ?', [payload.googleId, user.id]);
      } else {
        // Create new user (verified because Google already verified email)
        const userId = await User.create({
          email: payload.email,
          googleId: payload.googleId,
          name: payload.name,
          isVerified: true,
        });
        user = await User.findById(userId);
      }
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Google authentication failed' });
  }
};

// Forgot password - send reset email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    const token = await PasswordResetToken.create(user.id);
    await sendPasswordResetEmail(email, token);

    res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reset password (using token from email)
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const resetEntry = await PasswordResetToken.findByToken(token);
    if (!resetEntry) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(resetEntry.user_id, hashedPassword);
    await PasswordResetToken.delete(token);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};