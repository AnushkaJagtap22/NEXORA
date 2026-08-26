const db = require('../sqliteStore');

class OrderRepository {
  static getAll({ merchantId = null, buyerId = null, limit = 100, offset = 0 } = {}) {
    let sql = 'SELECT id, merchant_id as merchantId, buyer_id as buyerId, customer_id as customerId, customer_name as customerName, product_name as productName, quantity, subtotal, discount, amount, payment_id as paymentId, razorpay_order_id as razorpayOrderId, payment_status as paymentStatus, order_status as orderStatus, agent_session_id as agentSessionId, created_at as createdAt FROM orders WHERE 1=1';
    const params = [];

    if (merchantId) {
      sql += ' AND merchant_id = ?';
      params.push(merchantId);
    }

    if (buyerId) {
      sql += ' AND (buyer_id = ? OR customer_id = ?)';
      params.push(buyerId, buyerId);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return db.prepare(sql).all(...params);
  }

  static getById(id, merchantId = null, buyerId = null) {
    let sql = 'SELECT id, merchant_id as merchantId, buyer_id as buyerId, customer_id as customerId, customer_name as customerName, product_name as productName, quantity, subtotal, discount, amount, payment_id as paymentId, razorpay_order_id as razorpayOrderId, payment_status as paymentStatus, order_status as orderStatus, agent_session_id as agentSessionId, created_at as createdAt FROM orders WHERE id = ?';
    const params = [id];

    if (merchantId) {
      sql += ' AND merchant_id = ?';
      params.push(merchantId);
    }

    if (buyerId) {
      sql += ' AND (buyer_id = ? OR customer_id = ?)';
      params.push(buyerId, buyerId);
    }

    return db.prepare(sql).get(...params);
  }

  static create({ id, merchantId = 'merch_001', buyerId = 'buyer_291', customerId = 'cust_0001', customerName = 'Rahul Sharma', productName, quantity = 1, subtotal, discount = 0, amount, paymentId, razorpayOrderId = 'order_Kz82n1M901', paymentStatus = 'Paid', orderStatus = 'Confirmed', agentSessionId = 'AB-291' }) {
    const createdAt = new Date().toISOString();
    const computedSubtotal = subtotal !== undefined ? subtotal : (amount + discount);
    const computedPaymentId = paymentId || `pay_sim_${Date.now()}`;

    const stmt = db.prepare(
      'INSERT INTO orders (id, merchant_id, buyer_id, customer_id, customer_name, product_name, quantity, subtotal, discount, amount, payment_id, razorpay_order_id, payment_status, order_status, agent_session_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    stmt.run(id, merchantId, buyerId, customerId, customerName, productName, quantity, computedSubtotal, discount, amount, computedPaymentId, razorpayOrderId, paymentStatus, orderStatus, agentSessionId, createdAt);

    return this.getById(id);
  }
}

module.exports = OrderRepository;
