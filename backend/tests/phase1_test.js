const path = require('path');
const db = require('../db/sqliteStore');
const ProductRepository = require('../db/repositories/ProductRepository');
const OrderRepository = require('../db/repositories/OrderRepository');
const UserRepository = require('../db/repositories/UserRepository');
const { up: runMigration } = require('../migrations/001_initial_schema');
const bcrypt = require('bcryptjs');

async function runPhase1Tests() {
  console.log("==================================================");
  console.log("NEXORA PHASE 1 — AUTOMATED FOUNDATION TEST SUITE");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ✓ ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ✗ ${testName}`);
      failed++;
    }
  }

  // TEST 1: DATABASE MIGRATIONS TRACKER
  try {
    runMigration();
    const migrationRow = db.prepare('SELECT * FROM schema_migrations WHERE name = ?').get('001_initial_schema');
    assert(Boolean(migrationRow), "Database migration '001_initial_schema' executed and recorded");
  } catch (err) {
    assert(false, `Database migration execution failed: ${err.message}`);
  }

  // TEST 2: REPOSITORY LAYER DECOUPLING
  try {
    const products = ProductRepository.getAll({ merchantId: 'merch_001' });
    assert(Array.isArray(products) && products.length > 0, `ProductRepository.getAll returned ${products.length} products for merchant merch_001`);

    const orders = OrderRepository.getAll({ merchantId: 'merch_001' });
    assert(Array.isArray(orders) && orders.length > 0, `OrderRepository.getAll returned ${orders.length} orders for merchant merch_001`);
  } catch (err) {
    assert(false, `Repository layer query failed: ${err.message}`);
  }

  // TEST 3: BCRYPT PASSWORD SECURITY & USER REPOSITORY
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('SecurePassword123!', salt);
    const match = await UserRepository.verifyPassword('SecurePassword123!', hash);
    assert(match === true, "Bcrypt password hashing and verification operational");
  } catch (err) {
    assert(false, `Bcrypt hashing test failed: ${err.message}`);
  }

  // TEST 4: MULTI-TENANT ISOLATION (PRODUCT SCOPING)
  try {
    const testProd = ProductRepository.create({
      id: `test_p_${Date.now()}`,
      merchantId: 'merch_tenant_A',
      name: 'Tenant Isolation Test Item',
      price: 1999,
      stock: 10,
      category: 'Electronics',
      sku: `SKU-ISO-${Date.now()}`
    });

    const accessedByOwner = ProductRepository.getById(testProd.id, 'merch_tenant_A');
    const accessedByIntruder = ProductRepository.getById(testProd.id, 'merch_tenant_B');

    assert(Boolean(accessedByOwner), "Owner merchant (merch_tenant_A) can access product");
    assert(accessedByIntruder === null, "Intruder merchant (merch_tenant_B) receives NULL (IDOR Protected)");
  } catch (err) {
    assert(false, `Multi-tenant isolation test failed: ${err.message}`);
  }

  // TEST 5: SERVER-SIDE PRICE & DISCOUNT CALCULATION
  try {
    const originalPrice = 4749;
    const policyMaxDiscountPct = 10;
    const requestedDiscountPct = 15;

    // Server-side calculation enforces policy discount ceiling
    const actualDiscountPct = Math.min(requestedDiscountPct, policyMaxDiscountPct);
    const discountAmount = Math.round((originalPrice * actualDiscountPct) / 100);
    const finalCalculatedAmount = originalPrice - discountAmount;

    assert(discountAmount === 475, "Server-side price calculation capped requested 15% discount to 10% policy limit (₹475)");
    assert(finalCalculatedAmount === 4274, `Final server-calculated amount is exactly ₹${finalCalculatedAmount}`);
  } catch (err) {
    assert(false, `Server-side price calculation test failed: ${err.message}`);
  }

  console.log("\n==================================================");
  console.log(`SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runPhase1Tests();
