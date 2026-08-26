const db = require('../db/sqliteStore');
const { getDB } = require('../db/store');
const { callMistralLLM } = require('./aiAgentService');
const { evaluateAction } = require('./policyEngine');

async function getContextualRecommendations({ productId, customerId = 'cust_0001', cartItems = [], cartSubtotal = 4499, queryIntent = null }) {
  const storeState = getDB();
  const currentProduct = storeState.products.find(p => p.id === productId) || storeState.products[0];

  // Retrieve Candidate Set from SQLite Database
  let candidateRows = [];
  try {
    candidateRows = db.prepare(
      "SELECT id, name, price, stock, category, sku, image, description FROM products WHERE status = 'ACTIVE' AND stock > 0 AND id != ?"
    ).all(currentProduct.id);
  } catch (e) {
    candidateRows = storeState.products.filter(p => p.id !== currentProduct.id);
  }

  const cartProductIds = new Set(cartItems.map(i => i.id));

  // Retrieve Customer Context
  let customer = { segment: 'STANDARD', affinityTags: ['Audio', 'Accessories'] };
  try {
    const custRow = db.prepare("SELECT segment FROM customers WHERE id = ?").get(customerId);
    if (custRow) customer = { ...customer, ...custRow };
  } catch (e) {}

  // Context-Aware Composite Scoring Engine
  // Score = Relevance + CustomerAffinity + CartCompatibility + InventoryFactor + ExpectedValue
  const scoredCandidates = candidateRows.map(cand => {
    let relevanceScore = 0.5;
    if (cand.category === currentProduct.category) relevanceScore = 0.85;

    // Intent specific boosting
    if (queryIntent === 'TRAVEL' && (cand.name.toLowerCase().includes('travel') || cand.name.toLowerCase().includes('adapter') || cand.name.toLowerCase().includes('headphones'))) {
      relevanceScore += 0.3;
    } else if (queryIntent === 'GAMING' && (cand.name.toLowerCase().includes('mouse') || cand.name.toLowerCase().includes('keyboard') || cand.name.toLowerCase().includes('monitor'))) {
      relevanceScore += 0.3;
    } else if (queryIntent === 'WORK_SETUP' && (cand.name.toLowerCase().includes('keyboard') || cand.name.toLowerCase().includes('chair') || cand.name.toLowerCase().includes('arm'))) {
      relevanceScore += 0.3;
    }

    let customerAffinity = 0.1;
    if (customer.affinityTags && customer.affinityTags.includes(cand.category)) {
      customerAffinity = 0.25;
    }

    let cartCompatibility = cartProductIds.has(cand.id) ? 0 : 0.3;
    let inventoryFactor = Math.min(0.2, cand.stock / 100);

    // Expected Value Calculation (Price * estimated conversion probability)
    const expectedConversionProb = Math.min(0.8, 0.4 + relevanceScore * 0.3);
    const expectedValue = Math.round(cand.price * expectedConversionProb);

    const compositeScore = parseFloat((relevanceScore + customerAffinity + cartCompatibility + inventoryFactor).toFixed(2));

    return {
      cand,
      compositeScore,
      expectedValue,
      conversionProb: Math.round(expectedConversionProb * 100)
    };
  });

  // Sort by composite score descending
  scoredCandidates.sort((a, b) => b.compositeScore - a.compositeScore);

  // Evaluate Contextual Campaign Unlocks ("Spend More, Save More")
  let campaignNudge = null;
  if (cartSubtotal < 5000) {
    const gap = 5000 - cartSubtotal;
    const matchingCandidate = scoredCandidates.find(sc => sc.cand.price >= gap && !cartProductIds.has(sc.cand.id));
    if (matchingCandidate) {
      campaignNudge = {
        type: 'CAMPAIGN_QUALIFIER',
        campaignTitle: 'Spend ₹5,000 & Get ₹300 Off',
        gapAmount: gap,
        rewardAmount: 300,
        recommendedProduct: matchingCandidate.cand,
        reason: `Add ${matchingCandidate.cand.name} (₹${matchingCandidate.cand.price.toLocaleString()}) to unlock ₹300 off your checkout!`
      };
    }
  }

  // Build 3-5 Validated Recommendations
  const validatedRecommendations = [];
  const topScored = scoredCandidates.slice(0, 4);

  topScored.forEach((sc, idx) => {
    const dbProd = sc.cand;
    if (!dbProd || dbProd.stock <= 0 || cartProductIds.has(dbProd.id)) return;

    // Policy check
    const policyResult = evaluateAction({ action: 'offer_upsell', amount: dbProd.price }, storeState.policies);
    if (!policyResult.allowed) return;

    let type = 'COMPLETE_YOUR_SETUP';
    if (idx === 1) type = 'ACCESSORY_MATCH';
    else if (idx === 2) type = 'PRODUCTIVITY_BOOST';
    else if (idx === 3) type = 'POPULAR_UPGRADE';

    let reason = `Pairs seamlessly with ${currentProduct.name} to create a complete setup.`;
    if (queryIntent === 'TRAVEL') reason = `Lightweight companion recommended for your travel setup.`;
    else if (queryIntent === 'GAMING') reason = `High-precision peripheral matching your setup preference.`;

    validatedRecommendations.push({
      product: dbProd,
      type,
      reason,
      confidence: sc.compositeScore,
      expectedValue: sc.expectedValue,
      conversionRate: `${sc.conversionProb}%`
    });

    try {
      db.prepare(
        'INSERT INTO recommendations (id, product_id, customer_id, type, reason, shown, clicked, purchased, created_at) VALUES (?, ?, ?, ?, ?, 1, 0, 0, ?)'
      ).run(
        `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        currentProduct.id,
        customerId,
        type,
        reason,
        new Date().toISOString()
      );
    } catch (e) {}
  });

  return {
    success: true,
    currentProduct,
    recommendations: validatedRecommendations,
    campaignNudge
  };
}

module.exports = {
  getContextualRecommendations
};
