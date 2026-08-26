// Immutable Audit Logger Service

class AuditLogger {
  constructor() {
    this.logs = [];
  }

  log({ transactionId, customer, action, policyStatus, expectedValue, reason, checks = [], razorpayRef = null, outcome = "SUCCESS" }) {
    const entry = {
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      transactionId,
      customerName: customer?.name || "Guest Customer",
      customerEmail: customer?.email || "guest@example.com",
      action,
      policyStatus,
      expectedValue,
      reason,
      checks,
      razorpayRef,
      outcome
    };

    this.logs.unshift(entry);
    return entry;
  }

  getLogs({ limit = 100, filterStatus = null } = {}) {
    let result = [...this.logs];
    if (filterStatus) {
      result = result.filter(log => log.policyStatus === filterStatus || log.outcome === filterStatus);
    }
    return result.slice(0, limit);
  }
}

module.exports = AuditLogger;
