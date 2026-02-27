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
    isVerified,
    100  // default credits for new users
  ];

  const [result] = await pool.execute(
    'INSERT INTO users (email, password, google_id, name, is_verified, credits) VALUES (?, ?, ?, ?, ?, ?)',
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
  // Add to existing User class

static async getCredits(userId) {
  const [rows] = await pool.execute('SELECT credits FROM users WHERE id = ?', [userId]);
  return rows[0]?.credits;
}

static async generateReferralCode(userId) {
  // Generate a random 8-character alphanumeric code
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  await pool.execute('UPDATE users SET referral_code = ? WHERE id = ?', [code, userId]);
  return code;
}

static async findByReferralCode(code) {
  const [rows] = await pool.execute('SELECT id FROM users WHERE referral_code = ?', [code]);
  return rows[0];
}
static async updateLastVerificationSent(userId) {
  await pool.execute('UPDATE users SET last_verification_sent_at = NOW() WHERE id = ?', [userId]);
}
static async updateCredits(userId, amount, appId = null, description = '') {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Lock the user row to prevent race conditions
    const [userRows] = await connection.execute(
      'SELECT credits FROM users WHERE id = ? FOR UPDATE',
      [userId]
    );
    if (userRows.length === 0) throw new Error('User not found');

    const newCredits = userRows[0].credits + amount;
    if (newCredits < 0) throw new Error('Insufficient credits'); // should be caught earlier

    await connection.execute(
      'UPDATE users SET credits = credits + ? WHERE id = ?',
      [amount, userId]
    );

    // Log transaction
    await connection.execute(
      'INSERT INTO credit_transactions (user_id, app_id, amount, description) VALUES (?, ?, ?, ?)',
      [userId, appId, amount, description]
    );

    await connection.commit();
    return newCredits;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
}

module.exports = User;