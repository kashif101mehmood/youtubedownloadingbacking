const User = require('../models/User');

// Generate a referral link for the authenticated user
exports.generateReferralLink = async (req, res) => {
  try {
    let user = await User.findById(req.userId);
    if (!user.referral_code) {
      // Generate and save a new code
      const code = await User.generateReferralCode(req.userId);
      user.referral_code = code;
    }
    // Construct the link (adjust your frontend URL)
    const link = `https://yourapp.com/register?ref=${user.referral_code}`;
    res.json({ referralLink: link, code: user.referral_code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};