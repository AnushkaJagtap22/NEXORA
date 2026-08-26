// Batch Transaction Simulation Engine

const failureReasons = [
  "UPI_PSP_TIMEOUT",
  "CARD_AUTHENTICATION_FAILED",
  "ABANDONED_CHECKOUT",
  "INSUFFICIENT_FUNDS",
  "NETBANKING_SESSION_EXPIRED"
];

const customerNames = [
  "Aarav Sharma", "Ananya Iyer", "Vikram Malhotra", "Rhea Kapoor",
  "Karan Patel", "Meera Sen", "Aditya Nair", "Divya Joshi", "Rohan Mehta"
];

class SimulationEngine {
  constructor(policyEngine, mlEngine, auditLogger) {
    this.policyEngine = policyEngine;
    this.mlEngine = mlEngine;
    this.auditLogger = auditLogger;
  }

  /**
   * Runs a batch of N synthetic transactions and returns aggregated financial outcome telemetry
   */
  runBatchSimulation({ count = 20, simulateRazorpayFailures = false }) {
    const results = [];
    let totalRevenueAtRisk = 0;
    let totalRecoveredRevenue = 0;
    let recoveredCount = 0;
    let blockedCount = 0;
    let escalatedCount = 0;
    let failedSafelyCount = 0;

    for (let i = 0; i < count; i++) {
      const amount = Math.floor(Math.random() * 9000) + 2000; // ₹2,000 to ₹11,000
      const failureReason = failureReasons[Math.floor(Math.random() * failureReasons.length)];
      const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
      const ltv = Math.floor(Math.random() * 25000) + 1000;
      const priorPayments = Math.floor(Math.random() * 8);
      const retryAttempts = Math.floor(Math.random() * 3);

      totalRevenueAtRisk += amount;

      // ML Probability prediction & EV
      const prob = this.mlEngine.predictRecoveryProbability({
        ltv, priorSuccessfulPayments: priorPayments, failureReason, amount, retryCount: retryAttempts
      });

      const rec = this.mlEngine.getRecommendation({
        customer: { ltv, priorSuccessfulPayments: priorPayments },
        product: { price: amount },
        failureReason,
        retryCount: retryAttempts,
        policyMaxDiscount: this.policyEngine.policies.maxDiscountPercentage
      });

      // Pass through Deterministic Policy Engine
      const policyEvaluation = this.policyEngine.evaluate({
        amount,
        discountPercentage: rec.proposedDiscount,
        retryAttempts,
        customerLtv: ltv,
        expectedValue: rec.expectedValue
      });

      let finalStatus = "FAILED";
      let recoveredAmount = 0;

      if (simulateRazorpayFailures && Math.random() < 0.25) {
        // Razorpay API safe failure scenario
        finalStatus = "FAILED_SAFELY";
        failedSafelyCount++;
        policyEvaluation.summaryReason = "Razorpay API Timeout / Error: Payment stopped safely without duplicate charge.";
      } else if (policyEvaluation.status === "BLOCKED") {
        finalStatus = "BLOCKED_BY_POLICY";
        blockedCount++;
      } else if (policyEvaluation.status === "NEEDS_APPROVAL") {
        finalStatus = "HUMAN_ESCALATED";
        escalatedCount++;
      } else if (prob >= 0.50) {
        finalStatus = "RECOVERED";
        recoveredCount++;
        recoveredAmount = amount - (amount * policyEvaluation.sanitizedDiscount / 100);
        totalRecoveredRevenue += recoveredAmount;
      } else {
        finalStatus = "UNRECOVERED";
      }

      // Log to Audit Trail
      this.auditLogger.log({
        transactionId: `sim_tx_${Date.now()}_${i + 1}`,
        customer: { name: customerName, email: `${customerName.toLowerCase().replace(' ', '.')}@example.com` },
        action: rec.actionType,
        policyStatus: policyEvaluation.status,
        expectedValue: rec.expectedValue,
        reason: policyEvaluation.summaryReason,
        checks: policyEvaluation.checks,
        outcome: finalStatus
      });

      results.push({
        id: `sim_${i + 1}`,
        customerName,
        amount,
        failureReason,
        recoveryProbability: prob,
        expectedValue: rec.expectedValue,
        policyStatus: policyEvaluation.status,
        finalStatus,
        recoveredAmount
      });
    }

    const recoveryRate = count > 0 ? parseFloat(((recoveredCount / count) * 100).toFixed(1)) : 0;

    return {
      totalSimulated: count,
      totalRevenueAtRisk,
      totalRecoveredRevenue: Math.round(totalRecoveredRevenue),
      recoveredCount,
      blockedCount,
      escalatedCount,
      failedSafelyCount,
      recoveryRate,
      results
    };
  }
}

module.exports = SimulationEngine;
