// Initial Data store for RecoverX Merchant System

const catalog = [
  {
    id: "prod_001",
    name: "Nexora Ultra AI Smartwatch Pro",
    sku: "NEX-SW-001",
    category: "Electronics / Wearables",
    description: "Flagship AMOLED Smartwatch with AI Health Coach, Titanium Bezel & 14-day battery life.",
    price: 8999,
    currency: "INR",
    stock: 45,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60",
    addOns: [
      { id: "addon_w1", name: "2-Year Screen & Liquid Damage Warranty", price: 699, evScore: 0.85 },
      { id: "addon_s1", name: "Premium Leather + Silicone Strap Pack", price: 499, evScore: 0.78 },
      { id: "addon_d1", name: "Express 1-Hour VIP Delivery", price: 199, evScore: 0.92 }
    ],
    jsonLd: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Nexora Ultra AI Smartwatch Pro",
      "image": ["https://images.unsplash.com/photo-1523275335684-37898b6baf30"],
      "description": "Flagship AMOLED Smartwatch with AI Health Coach, Titanium Bezel & 14-day battery life.",
      "sku": "NEX-SW-001",
      "brand": { "@type": "Brand", "name": "Nexora" },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "INR",
        "price": "8999.00",
        "availability": "https://schema.org/InStock",
        "seller": { "@type": "Organization", "name": "Nexora Direct" }
      }
    }
  },
  {
    id: "prod_002",
    name: "AeroSound Noise-Cancelling Headphones",
    sku: "AERO-NC-002",
    category: "Audio",
    description: "Studio-grade ANC Headphones with Spatial Audio, 40-hour playback, and dual mic setup.",
    price: 12499,
    currency: "INR",
    stock: 30,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
    addOns: [
      { id: "addon_w2", name: "3-Year Hardware Extended Coverage", price: 999, evScore: 0.88 },
      { id: "addon_c1", name: "Hard-Shell Traveler Case", price: 599, evScore: 0.82 }
    ],
    jsonLd: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "AeroSound Noise-Cancelling Headphones",
      "image": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e"],
      "description": "Studio-grade ANC Headphones with Spatial Audio, 40-hour playback, and dual mic setup.",
      "sku": "AERO-NC-002",
      "brand": { "@type": "Brand", "name": "AeroSound" },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "INR",
        "price": "12499.00",
        "availability": "https://schema.org/InStock"
      }
    }
  },
  {
    id: "prod_003",
    name: "Lumina Vision Ergonomic Desk Lamp",
    sku: "LUM-DL-003",
    category: "Smart Home",
    description: "Adaptive auto-dimming LED desk lamp with wireless charging base and app integration.",
    price: 3499,
    currency: "INR",
    stock: 80,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60",
    addOns: [
      { id: "addon_w3", name: "1-Year Extended Warranty", price: 299, evScore: 0.90 }
    ],
    jsonLd: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Lumina Vision Ergonomic Desk Lamp",
      "image": ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c"],
      "description": "Adaptive auto-dimming LED desk lamp with wireless charging base and app integration.",
      "sku": "LUM-DL-003",
      "brand": { "@type": "Brand", "name": "Lumina" },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "INR",
        "price": "3499.00",
        "availability": "https://schema.org/InStock"
      }
    }
  },
  {
    id: "prod_004",
    name: "Zenith Mechanical Keyboard (RGB Wireless)",
    sku: "ZEN-KB-004",
    category: "Accessories",
    description: "Hot-swappable tactile mechanical keyboard with Bluetooth 5.2 and custom PBT keycaps.",
    price: 5999,
    currency: "INR",
    stock: 60,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60",
    addOns: [
      { id: "addon_k1", name: "Custom Coiled Type-C Cable", price: 399, evScore: 0.84 },
      { id: "addon_k2", name: "Ergonomic Memory Foam Wrist Rest", price: 299, evScore: 0.89 }
    ],
    jsonLd: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Zenith Mechanical Keyboard (RGB Wireless)",
      "image": ["https://images.unsplash.com/photo-1587829741301-dc798b83add3"],
      "description": "Hot-swappable tactile mechanical keyboard with Bluetooth 5.2 and custom PBT keycaps.",
      "sku": "ZEN-KB-004",
      "brand": { "@type": "Brand", "name": "Zenith" },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "INR",
        "price": "5999.00",
        "availability": "https://schema.org/InStock"
      }
    }
  }
];

const initialPolicies = {
  maxDiscountPercentage: 10,       // Max automatic discount (10%)
  maxAutomaticAmount: 10000,       // Amounts > 10,000 INR require human approval
  maxRetryAttempts: 2,             // Max 2 payment retries per customer per order
  cooldownPeriodHours: 24,         // 24 hour contact cooldown per customer
  humanApprovalThresholdEV: 2500,  // EV > ₹2,500 requires human merchant escalation if high risk
  enableHinglishSupport: true,
  autoApproveSafeActions: true
};

const initialCampaigns = [
  {
    id: "camp_001",
    title: "Abandoned Cart High-Intent Nudge",
    type: "ABANDONED_CART",
    status: "ACTIVE",
    budget: 15000,
    spentBudget: 4200,
    targetAudience: "High-LTV Customers with cart value > ₹4,000",
    offer: "5% Instant UPI Discount + Free Express Shipping",
    convertedCount: 14,
    totalAttempted: 22,
    maxAttemptsPerUser: 2,
    autoStopThreshold: 15000,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "camp_002",
    title: "UPI Payment Timeout Recovery Sprint",
    type: "PAYMENT_RETRY",
    status: "ACTIVE",
    budget: 10000,
    spentBudget: 2800,
    targetAudience: "UPI PSP Timeout Failures (GooglePay/PhonePe)",
    offer: "Instant WhatsApp Payment Link with ₹100 Cashback",
    convertedCount: 19,
    totalAttempted: 28,
    maxAttemptsPerUser: 1,
    autoStopThreshold: 10000,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: "camp_003",
    title: "Festival Tech Upsell Festival",
    type: "FESTIVAL_UPSELL",
    status: "PAUSED",
    budget: 25000,
    spentBudget: 25000,
    targetAudience: "Repeat buyers purchasing audio & wearables",
    offer: "Warranty Bundle @ ₹199 (Original ₹699)",
    convertedCount: 45,
    totalAttempted: 60,
    maxAttemptsPerUser: 2,
    autoStopThreshold: 25000,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

const initialTransactions = [
  {
    id: "tx_1001",
    customer: { name: "Rahul Sharma", email: "rahul.s@example.com", phone: "+919876543210", ltv: 18500, priorSuccessfulPayments: 4 },
    product: catalog[0],
    amount: 8999,
    status: "RECOVERED",
    failureReason: "UPI_PSP_TIMEOUT",
    paymentMethod: "UPI (Google Pay)",
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    recoveryAttempts: 1,
    agentDecision: {
      action: "SEND_WHATSAPP_PAYMENT_LINK_WITH_DISCOUNT",
      discountPercentage: 5,
      discountedAmount: 8549,
      expectedValue: 6150,
      recoveryProbability: 0.76,
      policyStatus: "ALLOWED",
      reason: "High customer LTV (₹18,500) and 4 prior successful payments. Discount (5%) within safety threshold (10%)."
    },
    razorpayOrderId: "order_Kz82n1M901",
    razorpayPaymentId: "pay_Kz82n1M902_success"
  },
  {
    id: "tx_1002",
    customer: { name: "Priya Patel", email: "priya.p@example.com", phone: "+919876543211", ltv: 32400, priorSuccessfulPayments: 7 },
    product: catalog[1],
    amount: 12499,
    status: "HUMAN_ESCALATED",
    failureReason: "CARD_AUTHENTICATION_FAILED",
    paymentMethod: "HDFC Credit Card",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    recoveryAttempts: 2,
    agentDecision: {
      action: "REQUIRES_MERCHANT_APPROVAL",
      discountPercentage: 10,
      discountedAmount: 11249,
      expectedValue: 7800,
      recoveryProbability: 0.69,
      policyStatus: "NEEDS_APPROVAL",
      reason: "Order amount (₹12,499) exceeds merchant automatic approval limit (₹10,000). Escalated to merchant dashboard."
    },
    razorpayOrderId: "order_Kz82n1M903",
    razorpayPaymentId: null
  },
  {
    id: "tx_1003",
    customer: { name: "Anish Verma", email: "anish.v@example.com", phone: "+919876543212", ltv: 5200, priorSuccessfulPayments: 1 },
    product: catalog[2],
    amount: 3499,
    status: "RECOVERED",
    failureReason: "ABANDONED_CHECKOUT",
    paymentMethod: "NetBanking (ICICI)",
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    recoveryAttempts: 1,
    agentDecision: {
      action: "CONVERSATIONAL_UPSELL_NUDGE",
      discountPercentage: 0,
      upsellItem: catalog[2].addOns[0],
      expectedValue: 2850,
      recoveryProbability: 0.82,
      policyStatus: "ALLOWED",
      reason: "Cart value ₹3,499. High probability recovery via Hinglish interactive chat with ₹299 warranty upsell."
    },
    razorpayOrderId: "order_Kz82n1M904",
    razorpayPaymentId: "pay_Kz82n1M905_success"
  },
  {
    id: "tx_1004",
    customer: { name: "Sneha Reddy", email: "sneha.r@example.com", phone: "+919876543213", ltv: 1200, priorSuccessfulPayments: 0 },
    product: catalog[3],
    amount: 5999,
    status: "FAILED_SAFELY",
    failureReason: "INSUFFICIENT_FUNDS_RAZORPAY_SIMULATION_ERROR",
    paymentMethod: "UPI (PhonePe)",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    recoveryAttempts: 2,
    agentDecision: {
      action: "STOP_INTERVENTION_SAFE_STOP",
      discountPercentage: 0,
      expectedValue: 0,
      recoveryProbability: 0.12,
      policyStatus: "BLOCKED",
      reason: "Razorpay simulated API error: Payment failed safely without duplicate debit. Reached max retry limit (2)."
    },
    razorpayOrderId: "order_Kz82n1M906",
    razorpayPaymentId: null
  }
];

module.exports = {
  catalog,
  initialPolicies,
  initialCampaigns,
  initialTransactions
};
