const db = require('../db/sqliteStore');

// Lightweight Abuse & Anomaly Tracking Store
const failedAttemptsMap = new Map();

function evaluateAction({ action, requestedDiscount = 0, amount = 0, customerId = 'cust_0001' }, merchantPolicy = {}) {
  const maxDiscount = merchantPolicy.maxDiscountPercentage || 10;
  const maxAutoAmount = merchantPolicy.maxAutomaticAmount || 10000;

  // 1. LIGHTWEIGHT ABUSE / FRAUD GUARDRAIL
  const attemptCount = failedAttemptsMap.get(customerId) || 0;
  if (attemptCount >= 3) {
    // Log abuse trigger audit event
    try {
      db.prepare('INSERT INTO audit_events (id, order_id, agent_session_id, customer_name, action, reason, policy_result, expected_value, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        `audit_${Date.now()}`,
        'N/A',
        'AB-291',
        'Rahul Sharma (AI Buyer)',
        'ABUSE_GUARD_TRIGGERED',
        'Unusual activity detected (>3 failed attempts). Additional payment attempts temporarily paused for safety.',
        'BLOCKED',
        amount,
        new Date().toISOString()
      );
    } catch (e) {}

    return {
      allowed: false,
      status: 'ABUSE_GUARD_TRIGGERED',
      approvedDiscount: 0,
      reason: 'Unusual activity detected. Additional payment attempts temporarily paused for safety.'
    };
  }

  // 2. TRANSACTION AMOUNT THRESHOLD CHECK
  if (amount > maxAutoAmount) {
    return {
      allowed: false,
      status: 'HUMAN_APPROVAL_REQUIRED',
      approvedDiscount: 0,
      reason: `Transaction amount ₹${amount.toLocaleString()} exceeds merchant automatic threshold of ₹${maxAutoAmount.toLocaleString()}. Escalating for human merchant approval.`
    };
  }

  // 3. DISCOUNT CAP POLICY CHECK
  if (action === 'request_discount' || action === 'offer_upsell') {
    if (requestedDiscount > maxDiscount) {
      return {
        allowed: false,
        status: 'DISCOUNT_CAP_EXCEEDED',
        approvedDiscount: maxDiscount,
        reason: `Requested discount of ${requestedDiscount}% exceeds merchant maximum policy cap of ${maxDiscount}%. Capping offer at ${maxDiscount}%.`
      };
    }
  }

  return {
    allowed: true,
    status: 'POLICY_PASSED',
    approvedDiscount: Math.min(requestedDiscount, maxDiscount),
    reason: `Action ${action} complies with merchant policy (Discount: ${Math.min(requestedDiscount, maxDiscount)}% <= ${maxDiscount}%).`
  };
}

function recordFailedAttempt(customerId = 'cust_0001') {
  const count = failedAttemptsMap.get(customerId) || 0;
  failedAttemptsMap.set(customerId, count + 1);
}

function resetFailedAttempts(customerId = 'cust_0001') {
  failedAttemptsMap.delete(customerId);
}

module.exports = {
  evaluateAction,
  recordFailedAttempt,
  resetFailedAttempts
};
