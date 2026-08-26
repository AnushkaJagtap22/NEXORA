const db = require('./sqliteStore');

function runSeed() {
  console.log("Seeding relational SQLite database with multi-category product catalog...");

  const demoUsers = [
    ['usr_m001', 'Anushka Jagtap', 'anushka@nexora.com', '0e3183c45e8ef9bc95fc8a2dc83f040149d2c7193312aa0740da9c0d50b1f439', 'MERCHANT', 'merch_001', null, 'A'],
    ['usr_b291', 'Rahul Sharma (AI Buyer)', 'buyer@nexora.com', 'e547bd13228250dfb4c7df1d1ebb78cfd9f2ada56ebb0c425d35829dd3ac4ae8', 'AI_BUYER', null, 'buyer_291', 'R'],
    ['usr_a001', 'Platform Admin', 'admin@nexora.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'ADMIN', null, null, 'P']
  ];
  const seedUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, merchant_id, buyer_id, avatar, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO NOTHING
  `);
  for (const user of demoUsers) seedUser.run(...user, new Date().toISOString());

  // Seed Default Policy
  try {
    const policyStmt = db.prepare('INSERT OR IGNORE INTO policies (merchant_id, max_discount_percentage, max_automatic_amount, max_retry_attempts) VALUES (?, ?, ?, ?)');
    policyStmt.run('merch_001', 10.0, 10000.0, 3);
  } catch (e) {
    try {
      db.prepare('INSERT OR IGNORE INTO policies (merchant_id, max_discount_percentage, max_automatic_amount, max_retry_attempts, cooldown_period_hours) VALUES (?, ?, ?, ?, ?)').run('merch_001', 10.0, 10000.0, 3, 24);
    } catch (e2) {}
  }

  // Multi-Category Core Products Catalog
  const coreProducts = [
    { id: 'prod_lap_01', name: 'ZenBook AI Pro Laptop 15-inch', price: 48999, category: 'Laptops', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60', desc: 'Powerful Intel i7 16GB RAM laptop engineered for coding, AI development, and multitasking.' },
    { id: 'prod_lap_02', name: 'MacBook Air M2 Ultra-Thin', price: 74999, category: 'Laptops', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60', desc: 'Ultra-lightweight Apple M2 chip laptop with 18-hour battery life.' },
    { id: 'prod_mon_01', name: 'UltraSharp 27-inch 4K IPS Monitor', price: 21999, category: 'Monitors', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60', desc: 'Stunning 4K UHD color-accurate monitor with USB-C 65W charging for workstation setups.' },
    { id: 'prod_ms_01', name: 'ApexPro Wireless Gaming Mouse', price: 3899, category: 'Accessories', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=60', desc: 'Ergonomic 26,000 DPI wireless gaming mouse with sub-1ms response rate.' },
    { id: 'prod_kb_01', name: 'Zenith Mechanical RGB Keyboard', price: 5449, category: 'Keyboards', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60', desc: 'Custom tactile mechanical switches with per-key RGB backlighting and aluminum body.' },
    { id: 'prod_aud_01', name: 'AeroSound Noise-Cancelling Headphones', price: 3699, category: 'Audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60', desc: 'Active noise cancellation headphones with 40h battery life and HD spatial sound.' },
    { id: 'prod_bp_01', name: 'TravelPro 25L Business Backpack', price: 2499, category: 'Accessories', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60', desc: 'Water-resistant 25L laptop backpack engineered for 3-day business trips and travel.' },
    { id: 'prod_shoe_01', name: 'StrideFlex Everyday Running Shoes', price: 2899, category: 'Footwear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60', desc: 'Lightweight cushioned running shoes for everyday walking, travel, and training.' },
    { id: 'prod_cam_01', name: 'Lumina 4K StreamCam AI', price: 7099, category: 'Cameras', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60', desc: '4K 60fps streaming webcam with AI auto-framing and dual noise-cancelling mics.' },
    { id: 'prod_wt_01', name: 'Nexora Ultra AI Smartwatch Pro', price: 9149, category: 'Wearables', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60', desc: 'AMOLED fitness tracker with real-time health metrics, GPS, and 7-day battery.' }
  ];

  const insertProd = db.prepare(`
    INSERT OR IGNORE INTO products (id, merchant_id, name, price, stock, category, sku, image, description, agent_readiness, status, json_ld, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (let p of coreProducts) {
    const sku = `SKU-${p.id.toUpperCase()}`;
    const jsonLd = JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": p.name,
      "sku": sku,
      "category": p.category,
      "offers": { "@type": "Offer", "priceCurrency": "INR", "price": p.price, "availability": "https://schema.org/InStock" }
    });
    insertProd.run(p.id, 'merch_001', p.name, p.price, 30, p.category, sku, p.image, p.desc, 98, 'ACTIVE', jsonLd, new Date().toISOString());
  }

  // Seed Campaigns if empty
  const campCount = db.prepare('SELECT COUNT(*) as count FROM campaigns').get().count;
  if (campCount === 0) {
    const insertCamp = db.prepare(`
      INSERT INTO campaigns (id, merchant_id, name, description, type, status, start_at, end_at, discount_type, discount_value, max_discount_amount, minimum_cart_value, eligible_categories, eligible_product_ids, customer_segment, usage_limit, per_customer_limit, budget_limit, used_count, spent_budget, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertCamp.run(
      'camp_001', 'merch_001', 'Unlock ₹500 Savings', 'Spend ₹5,000 or more to get ₹500 off your order.', 'CART_THRESHOLD', 'ACTIVE',
      '2026-01-01T00:00:00Z', '2026-12-31T23:59:59Z', 'FIXED', 500, 500, 5000, 'ALL', 'ALL', 'ALL', 500, 1, 50000, 42, 21000, new Date().toISOString(), new Date().toISOString()
    );
  }

  console.log("Database seeded with multi-category product catalog.");
}

module.exports = { runSeed };
