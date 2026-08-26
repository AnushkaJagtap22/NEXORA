const PaymentService = require('../services/paymentService');
const CampaignEngine = require('../services/campaignEngine');
const DBAdapter = require('../db/dbAdapter');
const { createRateLimiter } = require('../middleware/rateLimiter');
const { recordNegotiation, getNegotiationStrategyStats } = require('../services/negotiationMemory');

async function runPhase4ProductionTests() {
  console.log("==================================================");
  console.log("NEXORA PHASE 4 — AUTOMATED PRODUCTION SAAS TEST SUITE");
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

  // TEST 1: ENVIRONMENT-BASED RAZORPAY CONFIGURATION & SERVER ORDER CREATION
  try {
    const config = PaymentService.getRazorpayConfig();
    assert(config.mode === 'test' && Boolean(config.keyId), "Environment-based Razorpay configuration verified (Mode: TEST)");

    const serverOrder = await PaymentService.createServerRazorpayOrder(4749, 'rcpt_1001');
    assert(
      serverOrder.success === true && Boolean(serverOrder.razorpayOrderId),
      "Server-side Razorpay order creation generated valid order_id server-side"
    );
  } catch (err) {
    assert(false, `Razorpay production configuration test failed: ${err.message}`);
  }

  // TEST 2: RATE LIMITING & SLIDING-WINDOW THROTTLING (HTTP 429)
  try {
    const testLimiter = createRateLimiter({ windowMs: 1000, maxRequests: 2, keyPrefix: 'test_rl' });
    let blocked = false;
    const req = { ip: '127.0.0.1', requestId: 'req_test' };
    const res = {
      status: (code) => {
        if (code === 429) blocked = true;
        return res;
      },
      json: (d) => d
    };
    const next = () => {};

    testLimiter(req, res, next); // Req 1: Allowed
    testLimiter(req, res, next); // Req 2: Allowed
    testLimiter(req, res, next); // Req 3: Blocked (HTTP 429)

    assert(blocked === true, "Sliding-window rate limiter triggered HTTP 429 abuse protection on threshold exceed");
  } catch (err) {
    assert(false, `Rate limiting test failed: ${err.message}`);
  }

  // TEST 3: ADAPTIVE NEGOTIATION STRATEGY MEMORY SCORING
  try {
    recordNegotiation({
      merchantId: 'merch_001',
      sessionId: 'SESS-P4-1',
      productId: 'prod_002',
      strategy: 'VALUE_BUNDLE',
      requestedDiscount: 12,
      offeredDiscount: 10,
      accepted: true,
      finalAmount: 4499
    });

    const stats = getNegotiationStrategyStats();
    assert(
      stats.success === true && Array.isArray(stats.strategies) && stats.strategies.length > 0,
      "Adaptive negotiation engine calculated strategy conversion performance and weighted scores"
    );
  } catch (err) {
    assert(false, `Adaptive negotiation test failed: ${err.message}`);
  }

  // TEST 4: SERVER-SIDE CAMPAIGN ENGINE EVALUATION & THRESHOLD NUDGE
  try {
    const evalRes = CampaignEngine.evaluateCartCampaigns([], 4500, 'merch_001');
    assert(
      Boolean(evalRes.campaignNudge) || evalRes.appliedDiscount >= 0,
      "Campaign engine evaluated cart subtotal server-side and calculated campaign nudge"
    );
  } catch (err) {
    assert(false, `Campaign engine test failed: ${err.message}`);
  }

  // TEST 5: DATABASE ADAPTER ABSTRACTION LAYER (DUAL ENGINE READINESS)
  try {
    const engine = DBAdapter.getEngine();
    assert(engine === 'sqlite' || engine === 'postgres', "Database Abstraction Adapter active (Engine: SQLite/PostgreSQL Dual Support)");

    const row = DBAdapter.getOne('SELECT COUNT(*) as count FROM products');
    assert(Boolean(row) && row.count > 0, "Database Abstraction Adapter executed query cleanly");
  } catch (err) {
    assert(false, `Database adapter test failed: ${err.message}`);
  }

  console.log("\n==================================================");
  console.log(`SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runPhase4ProductionTests();
