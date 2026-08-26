const db = require('../db/sqliteStore');

class CampaignEngine {
  static getActiveCampaigns(merchantId = 'merch_001') {
    try {
      const rows = db.prepare("SELECT id, merchant_id as merchantId, name as title, type, discount_type as discountType, discount_value as discountValue, minimum_cart_value as spendThreshold, max_discount_amount as maxDiscount, used_count as usedCount, budget_limit as budget, spent_budget as spentBudget, status FROM campaigns WHERE status = 'ACTIVE'").all();
      return rows;
    } catch (e) {
      console.warn("[CampaignEngine] Query error:", e.message);
      return [];
    }
  }

  static evaluateCartCampaigns(cartItems = [], cartSubtotal = 0, merchantId = 'merch_001') {
    const activeCampaigns = this.getActiveCampaigns(merchantId);
    let bestDiscount = 0;
    let appliedCampaign = null;
    let campaignNudge = null;

    for (const camp of activeCampaigns) {
      const threshold = camp.spendThreshold || 5000;
      const amount = camp.discountValue || 500;

      // Threshold Campaign (Spend ₹5,000 -> Get ₹500 off)
      if (threshold > 0 && cartSubtotal >= threshold) {
        if (amount > bestDiscount) {
          bestDiscount = amount;
          appliedCampaign = camp;
        }
      } else if (threshold > 0 && cartSubtotal < threshold && cartSubtotal > 0) {
        const gap = threshold - cartSubtotal;
        campaignNudge = {
          campaignId: camp.id,
          campaignTitle: camp.title || 'Threshold Promotion',
          spendThreshold: threshold,
          gap,
          reason: `Add ₹${gap.toLocaleString()} more to unlock ${camp.title || 'Campaign Deal'} (₹${amount} off)!`
        };
      }
    }

    return {
      appliedDiscount: bestDiscount,
      appliedCampaign,
      campaignNudge
    };
  }

  static recordCampaignUsage(campaignId, discountAmount = 500) {
    try {
      db.prepare('UPDATE campaigns SET used_count = used_count + 1, spent_budget = spent_budget + ? WHERE id = ?').run(discountAmount, campaignId);
    } catch (e) {}
  }
}

module.exports = CampaignEngine;
