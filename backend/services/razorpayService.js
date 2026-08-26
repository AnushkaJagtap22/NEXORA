// Razorpay Test Mode Service with Failure Recovery Simulation

class RazorpayService {
  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_recoverx_key";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_recoverx_secret";
    this.simulateFailures = false; // Toggleable for demo failure safety testing
  }

  setSimulationFailureMode(enabled) {
    this.simulateFailures = enabled;
  }

  /**
   * Creates Razorpay Test-Mode Order
   */
  async createOrder({ amount, currency = "INR", receipt = `rcpt_${Date.now()}` }) {
    if (this.simulateFailures) {
      throw new Error("RAZORPAY_GATEWAY_TIMEOUT_SIMULATED: Payment Gateway connection timed out safely.");
    }

    const orderId = `order_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
    return {
      id: orderId,
      entity: "order",
      amount: Math.round(amount * 100), // Amount in paise
      amount_paid: 0,
      amount_due: Math.round(amount * 100),
      currency,
      receipt,
      status: "created",
      created_at: Math.floor(Date.now() / 1000)
    };
  }

  /**
   * Generates Razorpay Payment Link
   */
  async createPaymentLink({ amount, customer, description = "RecoverX Checkout Payment" }) {
    if (this.simulateFailures) {
      throw new Error("RAZORPAY_API_ERROR: Failed to generate link safely (No charge created).");
    }

    const linkId = `plink_${Math.random().toString(36).substring(2, 12)}`;
    return {
      id: linkId,
      amount: Math.round(amount * 100),
      currency: "INR",
      short_url: `https://rzp.io/i/test_${linkId}`,
      status: "created",
      customer: {
        name: customer.name || "Customer",
        email: customer.email || "customer@example.com",
        contact: customer.phone || "+919876543210"
      },
      description
    };
  }

  /**
   * Verifies Razorpay Webhook Payment Signature
   */
  verifyPaymentSignature({ orderId, paymentId, signature }) {
    if (!orderId || !paymentId) return false;
    // In test mode simulation, return true if IDs are valid
    return true;
  }
}

module.exports = RazorpayService;
