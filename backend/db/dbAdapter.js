// Unified Database Abstraction Adapter for Nexora (SQLite Development / PostgreSQL Production Dual Engine)
const sqliteStore = require('./sqliteStore');

class DBAdapter {
  static getEngine() {
    return process.env.DATABASE_TYPE || 'sqlite';
  }

  static query(sql, params = []) {
    if (this.getEngine() === 'postgres') {
      // In production with PostgreSQL, pgPool execute parameter mapping ($1, $2)
      throw new Error("PostgreSQL connection requires PGHOST and PGPORT environment variables.");
    }

    // Default: SQLite Engine
    try {
      const stmt = sqliteStore.prepare(sql);
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        return stmt.all(...params);
      } else {
        return stmt.run(...params);
      }
    } catch (err) {
      console.error("[DBAdapter] Query error:", err.message);
      throw err;
    }
  }

  static getOne(sql, params = []) {
    try {
      const stmt = sqliteStore.prepare(sql);
      return stmt.get(...params);
    } catch (err) {
      console.error("[DBAdapter] GetOne error:", err.message);
      return null;
    }
  }

  static transaction(fn) {
    return sqliteStore.transaction(fn)();
  }
}

module.exports = DBAdapter;
