const ProductRepository = require('../db/repositories/ProductRepository');

class AgentToolRegistry {
  static TOOLS = {
    'search_catalog': {
      riskLevel: 'LOW',
      description: 'Search active merchant products by query and category',
      execute: (args) => {
        const { search, category, merchantId } = args || {};
        return ProductRepository.getAll({ search, category, merchantId, status: 'ACTIVE', limit: 6 });
      }
    },
    'check_inventory': {
      riskLevel: 'LOW',
      description: 'Check real-time product stock level',
      execute: (args) => {
        const { productId, merchantId } = args || {};
        const p = ProductRepository.getById(productId, merchantId);
        return p ? { productId, stock: p.stock, available: p.stock > 0 } : { productId, stock: 0, available: false };
      }
    },
    'recommend_products': {
      riskLevel: 'LOW',
      description: 'Generate complementary product recommendations',
      execute: (args) => {
        const { category = 'Accessories', merchantId } = args || {};
        const items = ProductRepository.getAll({ category, merchantId, status: 'ACTIVE', limit: 4 });
        return items.map(item => ({
          product: item,
          reason: `Complements your ${category} selection.`
        }));
      }
    },
    'request_discount': {
      riskLevel: 'MEDIUM',
      description: 'Request a policy-bounded discount negotiation',
      execute: (args) => {
        const { requestedDiscountPct = 10, policyCapPct = 10 } = args || {};
        const approvedDiscount = Math.min(requestedDiscountPct, policyCapPct);
        const capped = requestedDiscountPct > policyCapPct;
        return {
          approved: true,
          approvedDiscount,
          capped,
          reason: capped
            ? `AI requested ${requestedDiscountPct}% discount capped to ${policyCapPct}% policy limit.`
            : `Discount of ${approvedDiscount}% approved by policy.`
        };
      }
    }
  };

  static executeTool(toolName, args, userRole = 'BUYER') {
    const tool = this.TOOLS[toolName];
    if (!tool) {
      return { success: false, reason: `UNREGISTERED_TOOL_${toolName}` };
    }

    // High risk actions cannot be directly triggered by LLM
    if (tool.riskLevel === 'HIGH' && userRole !== 'ADMIN') {
      return { success: false, reason: `HIGH_RISK_TOOL_REQUIRES_AUTHORIZATION` };
    }

    try {
      const result = tool.execute(args);
      return { success: true, toolName, riskLevel: tool.riskLevel, data: result };
    } catch (err) {
      return { success: false, reason: err.message };
    }
  }
}

module.exports = AgentToolRegistry;
