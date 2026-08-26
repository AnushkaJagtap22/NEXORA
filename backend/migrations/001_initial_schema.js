const db = require('../db/sqliteStore');

function up() {
  console.log("Executing migration 001_initial_schema...");

  // Ensure migrations tracking table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure core tables exist with indexes
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      merchant_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_merchant ON users(merchant_id);

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL DEFAULT 'merch_001',
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      stock INTEGER NOT NULL DEFAULT 25,
      category TEXT NOT NULL,
      sku TEXT,
      image TEXT,
      description TEXT,
      agent_readiness INTEGER DEFAULT 95,
      status TEXT DEFAULT 'ACTIVE',
      json_ld TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_products_merchant ON products(merchant_id);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL DEFAULT 'merch_001',
      buyer_id TEXT DEFAULT 'buyer_291',
      customer_id TEXT DEFAULT 'cust_0001',
      customer_name TEXT,
      product_name TEXT,
      quantity INTEGER DEFAULT 1,
      subtotal INTEGER,
      discount INTEGER DEFAULT 0,
      amount INTEGER NOT NULL,
      payment_id TEXT,
      razorpay_order_id TEXT,
      payment_status TEXT DEFAULT 'Paid',
      order_status TEXT DEFAULT 'Confirmed',
      agent_session_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_orders_merchant ON orders(merchant_id);
    CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

    CREATE TABLE IF NOT EXISTS auth_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_tokens_user ON auth_tokens(user_id);
  `);

  db.prepare('INSERT OR IGNORE INTO schema_migrations (name) VALUES (?)').run('001_initial_schema');
  console.log("Migration 001_initial_schema executed successfully.");
}

module.exports = { up };
