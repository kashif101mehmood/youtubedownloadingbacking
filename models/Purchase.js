const pool = require('../config/database');

class Purchase {
  static async create(userId, videoUrl, encryptionKey) {
    const [result] = await pool.execute(
      'INSERT INTO user_purchases (user_id, video_url, encryption_key) VALUES (?, ?, ?)',
      [userId, videoUrl, encryptionKey]
    );
    return result.insertId;
  }

  static async findByUserAndUrl(userId, videoUrl) {
    const [rows] = await pool.execute(
      'SELECT * FROM user_purchases WHERE user_id = ? AND video_url = ?',
      [userId, videoUrl]
    );
    return rows[0];
  }
}

module.exports = Purchase;