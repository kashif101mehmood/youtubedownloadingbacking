const pool = require('../config/database');
const crypto = require('crypto');

class PasswordResetToken {
  static async create(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await pool.execute(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
    return token;
  }

  static async findByToken(token) {
    const [rows] = await pool.execute(
      'SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()',
      [token]
    );
    return rows[0];
  }

  static async delete(token) {
    await pool.execute('DELETE FROM password_reset_tokens WHERE token = ?', [token]);
  }
}

module.exports = PasswordResetToken;