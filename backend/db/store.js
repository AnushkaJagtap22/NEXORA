const db = require('./sqliteStore');

function getDB() {
  let products = [];
  try {
    products = db.prepare('SELECT id, merchant_id as merchantId, name, price, stock, category, sku, image, description, agent_readiness as agentReadiness, status, json_ld as jsonLd FROM products ORDER BY id ASC').all().map(p => ({
      ...p,
      jsonLd: p.jsonLd ? JSON.parse(p.jsonLd) : {}
    }));
  } catch (e) {}

  let customers = [];
  try {
    customers = db.prepare('SELECT id, name, email, ltv, total_orders as totalOrders FROM customers').all();
  } catch (e) {}

  let orders = [];
  try {
    orders = db.prepare('SELECT id, merchant_id as merchantId, buyer_id as buyerId, customer_id as customerId, customer_name as customerName, product_name as productName, quantity, subtotal, discount, amount, payment_id as paymentId, razorpay_order_id as razorpayOrderId, payment_status as paymentStatus, order_status as orderStatus, agent_session_id as agentSessionId, created_at as createdAt FROM orders ORDER BY created_at DESC').all();
  } catch (e) {}

  let payments = [];
  try {
    payments = db.prepare('SELECT id, order_id as orderId, amount, provider, environment, status, razorpay_payment_id as razorpayPaymentId, razorpay_order_id as razorpayOrderId, created_at as createdAt FROM payments ORDER BY created_at DESC').all();
  } catch (e) {}

  let auditEvents = [];
  try {
    auditEvents = db.prepare('SELECT id, order_id as orderId, agent_session_id as agentSessionId, customer_name as customerName, action, reason, policy_result as policyResult, expected_value as expectedValue, timestamp FROM audit_events ORDER BY timestamp DESC').all();
  } catch (e) {}

  let campaigns = [];
  try {
    campaigns = db.prepare('SELECT id, name as title, name, type, budget_limit as budget, spent_budget as spentBudget, discount_value as discountPercent, status, used_count as convertedCount FROM campaigns').all();
  } catch (e) {}

  let policyRow = {
    maxDiscountPercentage: 10,
    maxAutomaticAmount: 10000,
    maxRetryAttempts: 3,
    cooldownPeriodHours: 24
  };
  try {
    const row = db.prepare('SELECT max_discount_percentage as maxDiscountPercentage, max_automatic_amount as maxAutomaticAmount, max_retry_attempts as maxRetryAttempts FROM policies LIMIT 1').get();
    if (row) {
      policyRow = { ...policyRow, ...row };
    }
  } catch (e) {}

  let authTokens = {};
  try {
    const tokens = db.prepare('SELECT token, user_json as userJson FROM auth_tokens').all();
    tokens.forEach(t => {
      try { authTokens[t.token] = JSON.parse(t.userJson); } catch (e) {}
    });
  } catch (e) {}

  let agentSessions = [];
  try {
    const sessionRows = db.prepare('SELECT session_id as sessionId, merchant_id as merchantId, customer_id as customerId, user_query as userQuery, llm_provider as llmProvider, llm_model as llmModel, reasoning, recommended_product as recommendedProduct, tool_logs as toolLogs, created_at as createdAt FROM agent_sessions ORDER BY created_at DESC LIMIT 50').all();
    agentSessions = sessionRows.map(s => ({
      ...s,
      toolLogs: s.toolLogs ? JSON.parse(s.toolLogs) : [],
      recommendedProduct: s.recommendedProduct ? JSON.parse(s.recommendedProduct) : null
    }));
  } catch (e) {}

  let negotiationMemory = [];
  try {
    negotiationMemory = db.prepare('SELECT id, merchant_id as merchantId, session_id as sessionId, product_id as productId, customer_id as customerId, strategy, requested_discount as requestedDiscount, offered_discount as offeredDiscount, accepted, order_value as orderValue, created_at as timestamp FROM negotiations ORDER BY created_at DESC').all();
  } catch (e) {}

  return {
    products,
    customers,
    orders,
    payments,
    auditEvents,
    campaigns,
    policies: policyRow,
    authTokens,
    agentSessions,
    negotiationMemory,
    activeCart: {
      items: [
        { id: 'prod_002', name: 'Wireless Headphones Pro', price: 4499, quantity: 1, category: 'Audio' }
      ],
      discountPercent: 0,
      warrantyAdded: false,
      warrantyPrice: 499
    }
  };
}

function saveDB(state) {
  return true;
}

module.exports = {
  getDB,
  saveDB,
  sqliteDB: db
};
