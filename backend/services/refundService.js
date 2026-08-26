const db = require('../db/sqliteStore');
const OrderRepository = require('../db/repositories/OrderRepository');

class RefundService {
  static createRefund({ orderId, merchantId, amount, reason = 'Customer return request' }) {
    const order = OrderRepository.getById(orderId, merchantId);
    if (!order) {
      return { success: false, reason: 'ORDER_NOT_FOUND' };
    }

    if (order.paymentStatus !== 'Paid' && order.orderStatus !== 'Confirmed') {
      return { success: false, reason: 'ORDER_NOT_ELIGIBLE_FOR_REFUND' };
    }

    const refundId = `rfnd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const createdAt = new Date().toISOString();

    db.prepare("INSERT INTO refunds (refund_id, order_id, merchant_id, amount, reason, status, created_at) VALUES (?, ?, ?, ?, ?, 'COMPLETED', ?)").run(
      refundId, orderId, merchantId, amount || order.amount, reason, createdAt
    );

    // Update order status
    db.prepare("UPDATE orders SET payment_status = 'Refunded', order_status = 'Refunded' WHERE id = ?").run(orderId);

    // Audit log
    db.prepare('INSERT INTO audit_events (id, order_id, agent_session_id, customer_name, action, reason, policy_result, expected_value, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      `aud_rfnd_${Date.now()}`,
      orderId,
      'AB-291',
      order.customerName || 'Merchant Admin',
      'REFUND_COMPLETED',
      `Merchant (${merchantId}) processed refund ${refundId} of ₹${amount || order.amount} for order ${orderId}`,
      'ALLOWED',
      amount || order.amount,
      createdAt
    );

    return {
      success: true,
      refundId,
      orderId,
      amount: amount || order.amount,
      status: 'COMPLETED'
    };
  }

  static getRefundsForMerchant(merchantId) {
    return db.prepare('SELECT refund_id as refundId, order_id as orderId, merchant_id as merchantId, amount, reason, status, created_at as createdAt FROM refunds WHERE merchant_id = ? ORDER BY created_at DESC').all(merchantId);
  }
}

module.exports = RefundService;
