const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'nexora.sqlite');
const db = new Database(dbPath);

// Enable WAL Mode for Concurrent Writes
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

const tables = [
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL,
    category TEXT NOT NULL,
    sku TEXT NOT NULL,
    image TEXT,
    description TEXT,
    agent_readiness INTEGER DEFAULT 95,
    status TEXT DEFAULT 'ACTIVE',
    json_ld TEXT,
    created_at TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    merchant_id TEXT,
    buyer_id TEXT,
    avatar TEXT,
    created_at TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS merchants (
    id TEXT PRIMARY KEY,
    business_name TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    created_at TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    segment TEXT DEFAULT 'STANDARD',
    total_orders INTEGER DEFAULT 0,
    ltv REAL DEFAULT 0,
    created_at TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL,
    buyer_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal REAL NOT NULL,
    discount REAL NOT NULL,
    amount REAL NOT NULL,
    payment_id TEXT NOT NULL,
    razorpay_order_id TEXT NOT NULL,
    payment_status TEXT NOT NULL,
    order_status TEXT NOT NULL,
    agent_session_id TEXT NOT NULL,
    created_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    amount REAL NOT NULL,
    provider TEXT NOT NULL,
    environment TEXT NOT NULL,
    status TEXT NOT NULL,
    razorpay_payment_id TEXT NOT NULL,
    razorpay_order_id TEXT NOT NULL,
    created_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS policies (
    merchant_id TEXT PRIMARY KEY,
    max_discount_percentage REAL NOT NULL,
    max_automatic_amount REAL NOT NULL,
    max_retry_attempts INTEGER NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    agent_session_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    action TEXT NOT NULL,
    reason TEXT NOT NULL,
    policy_result TEXT NOT NULL,
    expected_value REAL NOT NULL,
    timestamp TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS recommendations (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    type TEXT NOT NULL,
    reason TEXT NOT NULL,
    shown INTEGER DEFAULT 1,
    clicked INTEGER DEFAULT 0,
    purchased INTEGER DEFAULT 0,
    created_at TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    start_at TEXT,
    end_at TEXT,
    discount_type TEXT NOT NULL,
    discount_value REAL NOT NULL,
    max_discount_amount REAL,
    minimum_cart_value REAL DEFAULT 0,
    eligible_categories TEXT,
    eligible_product_ids TEXT,
    customer_segment TEXT DEFAULT 'ALL',
    usage_limit INTEGER DEFAULT 1000,
    per_customer_limit INTEGER DEFAULT 1,
    budget_limit REAL DEFAULT 100000,
    used_count INTEGER DEFAULT 0,
    spent_budget REAL DEFAULT 0,
    created_at TEXT,
    updated_at TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS auth_tokens (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS agent_sessions (
    session_id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    user_query TEXT NOT NULL,
    llm_provider TEXT NOT NULL,
    llm_model TEXT NOT NULL,
    reasoning TEXT,
    recommended_product TEXT,
    tool_logs TEXT,
    created_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS negotiations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    merchant_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    strategy TEXT NOT NULL,
    requested_discount REAL NOT NULL,
    offered_discount REAL NOT NULL,
    accepted INTEGER NOT NULL,
    final_amount REAL NOT NULL,
    resulting_revenue REAL DEFAULT 0,
    created_at TEXT NOT NULL
  );`
];

for (const sql of tables) {
  try {
    db.exec(sql);
  } catch (err) {
    console.error("Table creation error:", err.message);
  }
}

// Add expires_at column to auth_tokens if it doesn't exist yet
try {
  db.exec("ALTER TABLE auth_tokens ADD COLUMN expires_at TEXT;");
} catch (e) {}

module.exports = db;
