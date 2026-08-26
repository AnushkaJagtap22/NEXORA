const db = require('../sqliteStore');
const bcrypt = require('bcryptjs');

class UserRepository {
  static findByEmail(email) {
    const row = db.prepare('SELECT id, email, password_hash as passwordHash, role, name, merchant_id as merchantId, created_at as createdAt FROM users WHERE LOWER(email) = LOWER(?)').get(email);
    return row || null;
  }

  static findById(id) {
    const row = db.prepare('SELECT id, email, role, name, merchant_id as merchantId, created_at as createdAt FROM users WHERE id = ?').get(id);
    return row || null;
  }

  static async verifyPassword(plainPassword, passwordHash) {
    if (!passwordHash) return false;
    // Support legacy plain/SHA-256 fallback during migration if needed, but primary is bcrypt
    if (passwordHash.startsWith('$2a$') || passwordHash.startsWith('$2b$')) {
      return await bcrypt.compare(plainPassword, passwordHash);
    }
    // Fallback comparison for initial seed transition
    return plainPassword === passwordHash;
  }

  static async createUser({ id, email, password, role, name, merchantId }) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const createdAt = new Date().toISOString();

    const stmt = db.prepare('INSERT INTO users (id, email, password_hash, role, name, merchant_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, email, passwordHash, role, name, merchantId || null, createdAt);

    return this.findById(id);
  }
}

module.exports = UserRepository;
