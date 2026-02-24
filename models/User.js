const pool = require('../config/database');

class User {
  static async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByGoogleId(googleId) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE google_id = ?', [googleId]);
    return rows[0];
  }

static async create({ email, password, googleId, name, isVerified = false }) {
  // Replace any undefined values with null (SQL NULL)
  const params = [
    email,
    password !== undefined ? password : null,
    googleId !== undefined ? googleId : null,
    name !== undefined ? name : null,
    isVerified
  ];

  const [result] = await pool.execute(
    'INSERT INTO users (email, password, google_id, name, is_verified) VALUES (?, ?, ?, ?, ?)',
    params
  );
  return result.insertId;
}

  static async verify(userId) {
    await pool.execute('UPDATE users SET is_verified = TRUE WHERE id = ?', [userId]);
  }

  static async updatePassword(userId, hashedPassword) {
    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
  }
}

module.exports = User;