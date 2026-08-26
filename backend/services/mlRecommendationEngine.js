// ML Recommendation & Expected Recovery Value (EV) Engine

class MLRecommendationEngine {
  /**
   * Predicts recovery probability P_recovery based on customer features & failure context
   */
  predictRecoveryProbability({ ltv = 5000, priorSuccessfulPayments = 1, failureReason = "ABANDONED_CHECKOUT", amount = 5000, retryCount = 0 }) {
    let baseProb = 0.55;

    // Feature 1: Customer LTV weighting
    if (ltv > 20000) baseProb += 0.20;
    else if (ltv > 10000) baseProb += 0.12;
    else if (ltv > 3000) baseProb += 0.05;

    // Feature 2: Prior successful payments
    if (priorSuccessfulPayments >= 5) baseProb += 0.15;
    else if (priorSuccessfulPayments >= 2) baseProb += 0.08;

    // Feature 3: Failure Reason Penalty/Bonus
    if (failureReason === "UPI_PSP_TIMEOUT") baseProb += 0.10; // High intent, technical failure
    else if (failureReason === "ABANDONED_CHECKOUT") baseProb += 0.05;
    else if (failureReason === "INSUFFICIENT_FUNDS") baseProb -= 0.25;
    else if (failureReason === "CARD_AUTHENTICATION_FAILED") baseProb -= 0.10;

    // Feature 4: Retry Decay
    if (retryCount >= 1) baseProb -= 0.15 * retryCount;

    // Bound probability between 0.05 and 0.98
    return Math.min(0.98, Math.max(0.05, parseFloat(baseProb.toFixed(2))));
  }

  /**
   * Calculates Expected Recovery Value (EV)
   * EV = P_recovery * (Amount - Discount) - Operational Cost
   */
  calculateEV({ amount, probability, discountPercentage = 0, operationalCost = 50 }) {
    const discountAmount = (amount * discountPercentage) / 100;
    const netRevenue = amount - discountAmount;
    const ev = (probability * netRevenue) - operationalCost;
    return {
      ev: Math.round(ev),
      discountAmount: Math.round(discountAmount),
      netRevenue: Math.round(netRevenue),
      probability
    };
  }

  /**
   * Generates context-aware upsell / recovery recommendation with explainability factors
   */
  getRecommendation({ customer, product, failureReason, retryCount = 0, policyMaxDiscount = 10 }) {
    const ltv = customer?.ltv || 5000;
    const priorPayments = customer?.priorSuccessfulPayments || 1;
    const amount = product?.price || 5000;

    const prob = this.predictRecoveryProbability({ ltv, priorSuccessfulPayments: priorPayments, failureReason, amount, retryCount });
    
    // Choose optimal candidate intervention
    let proposedDiscount = 0;
    let actionType = "NUDGE_REMINDER";
    let selectedAddOn = null;

    if (prob > 0.70 && ltv > 10000) {
      proposedDiscount = Math.min(5, policyMaxDiscount);
      actionType = "WHATSAPP_LINK_WITH_DISCOUNT";
    } else if (prob > 0.50) {
      proposedDiscount = Math.min(10, policyMaxDiscount);
      actionType = "HINGLISH_CONVERSATIONAL_CHECKOUT";
    } else {
      proposedDiscount = 0;
      actionType = "EMAIL_NUDGE";
    }

    // Check catalog add-ons for upsell
    if (product && product.addOns && product.addOns.length > 0) {
      selectedAddOn = product.addOns[0]; // e.g. Warranty for ₹199 / ₹299
    }

    const evResult = this.calculateEV({ amount, probability: prob, discountPercentage: proposedDiscount });

    // Explainability factors
    const explainabilityFactors = [
      `Customer LTV of ₹${ltv.toLocaleString()} (${priorPayments} prior successful orders).`,
      `ML Failure Pattern: ${failureReason} gives baseline probability of ${(prob * 100).toFixed(0)}%.`,
      `Policy-Bounded Discount: Offered ${proposedDiscount}% (Max allowed: ${policyMaxDiscount}%).`,
      `Calculated Expected Net Value (EV): ₹${evResult.ev.toLocaleString()}.`
    ];

    return {
      actionType,
      probability: prob,
      proposedDiscount,
      discountedPrice: amount - evResult.discountAmount,
      expectedValue: evResult.ev,
      selectedAddOn,
      explainabilityFactors
    };
  }
}

module.exports = MLRecommendationEngine;
