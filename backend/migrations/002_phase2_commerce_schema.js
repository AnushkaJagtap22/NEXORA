const db = require('../db/sqliteStore');

function up() {
  console.log("Executing migration 002_phase2_commerce_schema...");

  db.exec(`
    -- Inventory Reservations Table
    CREATE TABLE IF NOT EXISTS inventory_reservations (
      reservation_id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      status TEXT DEFAULT 'ACTIVE',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_res_order ON inventory_reservations(order_id);
    CREATE INDEX IF NOT EXISTS idx_res_status ON inventory_reservations(status);

    -- Webhook Events Table for Idempotency
    CREATE TABLE IF NOT EXISTS webhook_events (
      event_id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      payload_hash TEXT NOT NULL,
      status TEXT DEFAULT 'PROCESSED',
      processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Refunds Table
    CREATE TABLE IF NOT EXISTS refunds (
      refund_id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      merchant_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'REQUESTED',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_refunds_order ON refunds(order_id);
    CREATE INDEX IF NOT EXISTS idx_refunds_merchant ON refunds(merchant_id);

    -- Negotiations Memory Table
    CREATE TABLE IF NOT EXISTS negotiations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      merchant_id TEXT NOT NULL DEFAULT 'merch_001',
      session_id TEXT,
      product_id TEXT,
      customer_id TEXT,
      strategy TEXT DEFAULT 'VALUE_BUNDLE',
      requested_discount INTEGER,
      offered_discount INTEGER,
      accepted INTEGER DEFAULT 1,
      final_amount INTEGER,
      order_value INTEGER,
      resulting_revenue INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_neg_merchant ON negotiations(merchant_id);

    -- Refresh Tokens Session Revocation Table
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      revoked INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_ref_user ON refresh_tokens(user_id);

    -- Analytics Behavior Event Tracking Table
    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      user_id TEXT,
      event_type TEXT NOT NULL,
      payload_json TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_evt_type ON analytics_events(event_type);
  `);

  // Ensure columns exist on legacy tables
  try { db.exec('ALTER TABLE negotiations ADD COLUMN final_amount INTEGER'); } catch (e) {}
  try { db.exec('ALTER TABLE negotiations ADD COLUMN order_value INTEGER'); } catch (e) {}
  try { db.exec('ALTER TABLE negotiations ADD COLUMN resulting_revenue INTEGER'); } catch (e) {}

  db.prepare('INSERT OR IGNORE INTO schema_migrations (name) VALUES (?)').run('002_phase2_commerce_schema');
  console.log("Migration 002_phase2_commerce_schema executed successfully.");
}

module.exports = { up };
