const pool = require('../config/database');
const crypto = require('crypto');

class VerificationToken {
  static async create(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await pool.execute(
      'INSERT INTO verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
    return token;
  }

  static async findByToken(token) {
    const [rows] = await pool.execute(
      'SELECT * FROM verification_tokens WHERE token = ? AND expires_at > NOW()',
      [token]
    );
    return rows[0];
  }

  static async delete(token) {
    await pool.execute('DELETE FROM verification_tokens WHERE token = ?', [token]);
  }
}

module.exports = VerificationToken;