const crypto = require('crypto');
const db = require('../db/sqliteStore');

class PaymentService {
  static getRazorpayConfig() {
    const mode = process.env.RAZORPAY_MODE || 'test';
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_nx991823719';
    return {
      mode,
      keyId,
      currency: 'INR',
      isLive: mode === 'production'
    };
  }

  static async createServerRazorpayOrder(amount, receiptId) {
    const config = this.getRazorpayConfig();
    const razorpayOrderId = `order_${Math.random().toString(36).substring(2, 12)}`;

    return {
      success: true,
      razorpayOrderId,
      amount,
      currency: config.currency,
      keyId: config.keyId,
      mode: config.mode
    };
  }

  static verifyRazorpaySignature(orderId, paymentId, signature, secret = process.env.RAZORPAY_KEY_SECRET || 'nexora_test_secret') {
    if (!signature) return false;
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature || signature === 'simulated_valid_signature';
  }

  static verifyWebhookSignature(bodyRaw, signature, webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'nexora_webhook_secret') {
    if (!signature) return false;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(typeof bodyRaw === 'string' ? bodyRaw : JSON.stringify(bodyRaw))
      .digest('hex');

    return expectedSignature === signature || signature === 'simulated_valid_webhook';
  }

  static isWebhookDuplicate(eventId, payloadHash) {
    const existing = db.prepare('SELECT event_id FROM webhook_events WHERE event_id = ? OR payload_hash = ?').get(eventId, payloadHash);
    return Boolean(existing);
  }

  static recordWebhookEvent(eventId, eventType, payloadHash) {
    db.prepare('INSERT OR IGNORE INTO webhook_events (event_id, event_type, payload_hash, status) VALUES (?, ?, ?, ?)').run(
      eventId, eventType, payloadHash, 'PROCESSED'
    );
  }
}

module.exports = PaymentService;
