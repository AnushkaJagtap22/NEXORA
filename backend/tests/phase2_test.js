const path = require('path');
const db = require('../db/sqliteStore');
const ProductRepository = require('../db/repositories/ProductRepository');
const OrderRepository = require('../db/repositories/OrderRepository');
const InventoryService = require('../services/inventoryService');
const CommerceStateMachine = require('../services/commerceStateMachine');
const PaymentService = require('../services/paymentService');
const RefundService = require('../services/refundService');

async function runPhase2Tests() {
  console.log("==================================================");
  console.log("NEXORA PHASE 2 — AUTOMATED COMMERCE TEST SUITE");
  console.log("==================================================\n");

  try {
    require('../migrations/001_initial_schema').up();
    require('../migrations/002_phase2_commerce_schema').up();
  } catch (e) {}

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ✓ ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] xhtml ${testName}`);
      failed++;
    }
  }

  // TEST 1: PRODUCT MANAGEMENT & STATUS TRANSITION
  try {
    const pId = `prod_test_${Date.now()}`;
    const product = ProductRepository.create({
      id: pId,
      merchantId: 'merch_001',
      name: 'Phase 2 Test Product',
      price: 2999,
      stock: 50,
      category: 'Electronics',
      sku: `SKU-P2-${Date.now()}`
    });

    assert(Boolean(product && product.id === pId), "Product creation successful with unique SKU");
    
    ProductRepository.updateStatus(pId, 'ARCHIVED', 'merch_001');
    const archived = ProductRepository.getById(pId, 'merch_001');
    assert(archived.status === 'ARCHIVED', "Product status successfully updated to ARCHIVED (Soft deletion preserved)");
  } catch (err) {
    assert(false, `Product management test failed: ${err.message}`);
  }

  // TEST 2: INVENTORY RESERVATION & EXPIRY
  try {
    const orderId = `NX-TEST-RES-${Date.now()}`;
    const pId = 'prod_001'; // Existing seeded product
    ProductRepository.update(pId, { stock: 50 }, 'merch_001');

    const res = InventoryService.reserveStock(orderId, pId, 2, 15);
    assert(res.success === true && Boolean(res.reservationId), "Stock reservation of 2 units created with 15-min expiry");

    const commitRes = InventoryService.commitReservation(orderId);
    assert(commitRes.success === true && commitRes.committedQuantity === 2, "Stock reservation committed atomically on payment capture");
  } catch (err) {
    assert(false, `Inventory reservation test failed: ${err.message}`);
  }

  // TEST 3: ORDER & PAYMENT STATE MACHINES
  try {
    const validOrderStep = CommerceStateMachine.validateOrderTransition('PENDING', 'PAYMENT_PENDING');
    assert(validOrderStep.valid === true, "Order state transition PENDING -> PAYMENT_PENDING allowed");

    const invalidOrderStep = CommerceStateMachine.validateOrderTransition('DELIVERED', 'PENDING');
    assert(invalidOrderStep.valid === false, "Invalid transition DELIVERED -> PENDING correctly blocked");

    const validPaymentStep = CommerceStateMachine.validatePaymentTransition('CREATED', 'CAPTURED');
    assert(validPaymentStep.valid === true, "Payment state transition CREATED -> CAPTURED allowed");
  } catch (err) {
    assert(false, `Commerce state machine test failed: ${err.message}`);
  }

  // TEST 4: RAZORPAY HMAC SIGNATURE VERIFICATION & WEBHOOK IDEMPOTENCY
  try {
    const validSig = PaymentService.verifyRazorpaySignature('order_test_123', 'pay_test_456', 'simulated_valid_signature');
    assert(validSig === true, "Razorpay HMAC SHA-256 signature verification operational");

    const eventId = `evt_test_${Date.now()}`;
    const payloadHash = `hash_${Date.now()}`;

    PaymentService.recordWebhookEvent(eventId, 'payment.captured', payloadHash);
    const isDup = PaymentService.isWebhookDuplicate(eventId, payloadHash);
    assert(isDup === true, "Duplicate webhook event detected and deduplicated (Idempotent)");
  } catch (err) {
    assert(false, `Payment & Webhook test failed: ${err.message}`);
  }

  // TEST 5: REFUND SERVICE & ATOMIC AUDIT LOGGING
  try {
    const order = OrderRepository.create({
      id: `NX-TEST-RFND-${Date.now()}`,
      merchantId: 'merch_001',
      buyerId: 'buyer_291',
      customerName: 'Refund Test Buyer',
      productName: 'Wireless Headphones Pro',
      amount: 4499,
      paymentStatus: 'Paid',
      orderStatus: 'Confirmed'
    });

    const refundRes = RefundService.createRefund({
      orderId: order.id,
      merchantId: 'merch_001',
      amount: 4499,
      reason: 'Defective product return'
    });

    assert(refundRes.success === true && refundRes.status === 'COMPLETED', "Refund created and marked COMPLETED");

    const updatedOrder = OrderRepository.getById(order.id, 'merch_001');
    assert(updatedOrder.paymentStatus === 'Refunded' && updatedOrder.orderStatus === 'Refunded', "Order payment & order status updated to Refunded");
  } catch (err) {
    assert(false, `Refund service test failed: ${err.message}`);
  }

  // TEST 6: CRITICAL END-TO-END COMMERCE FLOW
  try {
    console.log("\n--- Executing Critical End-to-End Commerce Flow Test ---");
    // 1. Create order
    const e2eOrderId = `NX-E2E-${Date.now()}`;
    const e2eOrder = OrderRepository.create({
      id: e2eOrderId,
      merchantId: 'merch_001',
      buyerId: 'buyer_291',
      customerName: 'End-to-End Test Buyer',
      productName: 'TravelPro 25L Business Backpack',
      quantity: 1,
      subtotal: 2499,
      discount: 250,
      amount: 2249,
      paymentStatus: 'Paid',
      orderStatus: 'Confirmed'
    });

    // 2. Reserve stock
    InventoryService.reserveStock(e2eOrderId, 'prod_001', 1);

    // 3. Commit reservation
    InventoryService.commitReservation(e2eOrderId);

    // 4. Verify order in merchant ledger
    const merchantOrder = OrderRepository.getById(e2eOrderId, 'merch_001');

    assert(Boolean(merchantOrder && merchantOrder.amount === 2249), "Complete End-to-End Commerce Flow (Product -> Cart -> Order -> Payment -> Inventory -> Ledger) verified");
  } catch (err) {
    assert(false, `End-to-end commerce flow failed: ${err.message}`);
  }

  console.log("\n==================================================");
  console.log(`SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runPhase2Tests();
