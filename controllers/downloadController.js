const crypto = require('crypto');
const User = require('../models/User');
const Purchase = require('../models/Purchase');

// Cost per download – you can make this dynamic (e.g., based on video length)
const CREDITS_PER_DOWNLOAD = 10;

exports.initiateDownload = async (req, res) => {
  const { videoUrl, appId } = req.body;
  const userId = req.userId;

  if (!videoUrl) {
    return res.status(400).json({ error: 'videoUrl is required' });
  }

  try {
    // 1. Check if user already purchased this video (optional – if you want to avoid double charge)
    const existingPurchase = await Purchase.findByUserAndUrl(userId, videoUrl);
    if (existingPurchase) {
      // User already paid for this video – return the existing key
      return res.json({
        key: existingPurchase.encryption_key,
        message: 'Video already purchased. Using existing key.'
      });
    }

    // 2. Check if user has enough credits
    const user = await User.findById(userId);
    if (user.credits < CREDITS_PER_DOWNLOAD) {
      return res.status(400).json({ error: 'Insufficient credits' });
    }

    // 3. Deduct credits (this method handles transaction and logging)
    await User.updateCredits(
      userId,
      -CREDITS_PER_DOWNLOAD,
      appId,
      `Download initiated for ${videoUrl}`
    );

    // 4. Generate a random encryption key (16 bytes hex for AES-128)
    const encryptionKey = crypto.randomBytes(16).toString('hex');

    // 5. Store purchase record
    await Purchase.create(userId, videoUrl, encryptionKey);

    // 6. Return the key
    res.json({
      key: encryptionKey,
      message: 'Credits deducted. You can now download and encrypt the video.'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Optional: endpoint to retrieve a previously purchased key
exports.getKey = async (req, res) => {
  const { videoUrl } = req.query;
  const userId = req.userId;

  if (!videoUrl) {
    return res.status(400).json({ error: 'videoUrl is required' });
  }

  try {
    const purchase = await Purchase.findByUserAndUrl(userId, videoUrl);
    if (!purchase) {
      return res.status(404).json({ error: 'No purchase found for this video' });
    }
    res.json({ key: purchase.encryption_key });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};