class CommerceStateMachine {
  static ORDER_TRANSITIONS = {
    'PENDING': ['PAYMENT_PENDING', 'CANCELLED', 'FAILED'],
    'PAYMENT_PENDING': ['PAID', 'CANCELLED', 'FAILED'],
    'PAID': ['PROCESSING', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED'],
    'PROCESSING': ['SHIPPED', 'CANCELLED'],
    'SHIPPED': ['DELIVERED'],
    'DELIVERED': ['REFUND_PENDING', 'REFUNDED'],
    'CANCELLED': [],
    'REFUND_PENDING': ['REFUNDED', 'PAID'],
    'REFUNDED': [],
    'FAILED': []
  };

  static PAYMENT_TRANSITIONS = {
    'CREATED': ['AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELLED'],
    'AUTHORIZED': ['CAPTURED', 'FAILED', 'CANCELLED'],
    'CAPTURED': ['REFUND_PENDING', 'REFUNDED'],
    'FAILED': [],
    'CANCELLED': [],
    'REFUND_PENDING': ['REFUNDED', 'CAPTURED'],
    'REFUNDED': []
  };

  static validateOrderTransition(currentStatus, targetStatus) {
    const allowed = this.ORDER_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      return {
        valid: false,
        reason: `Invalid Order status transition from '${currentStatus}' to '${targetStatus}'.`
      };
    }
    return { valid: true };
  }

  static validatePaymentTransition(currentStatus, targetStatus) {
    const allowed = this.PAYMENT_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      return {
        valid: false,
        reason: `Invalid Payment status transition from '${currentStatus}' to '${targetStatus}'.`
      };
    }
    return { valid: true };
  }
}

module.exports = CommerceStateMachine;
