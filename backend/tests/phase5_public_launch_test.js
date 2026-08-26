const AgentPlanner = require('../services/agentPlanner');
const CampaignEngine = require('../services/campaignEngine');
const ProductRepository = require('../db/repositories/ProductRepository');

async function runPhase5PublicLaunchTests() {
  console.log("==================================================");
  console.log("NEXORA PHASE 5 — AUTOMATED PUBLIC LAUNCH MVP TEST SUITE");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ✓ ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ✗ ${testName}`);
      failed++;
    }
  }

  // TEST 1: GUEST AI SHOPPING EXPLORATION WITHOUT AUTH TOKENS
  try {
    const res = await AgentPlanner.executePlannerLoop("Find me a laptop for coding under 50000");
    assert(
      res.success === true && res.products.length > 0 && res.products[0].category === 'Laptops',
      "Guest AI Shopping successfully executed natural laptop search query without requiring authentication"
    );
  } catch (err) {
    assert(false, `Guest AI search test failed: ${err.message}`);
  }

  // TEST 2: MULTI-CATEGORY CATALOG SEARCH COMPLETENESS
  try {
    const categories = ['Laptops', 'Monitors', 'Keyboards', 'Audio', 'Accessories', 'Cameras', 'Wearables'];
    let foundCount = 0;

    for (const cat of categories) {
      const prods = ProductRepository.getAll({ category: cat, status: 'ACTIVE' });
      if (prods.length > 0) foundCount++;
    }

    assert(foundCount === categories.length, "Multi-category product catalog contains active items across all 7 core categories");
  } catch (err) {
    assert(false, `Multi-category catalog test failed: ${err.message}`);
  }

  // TEST 3: CAMPAIGN THRESHOLD GAP CALCULATION & NUDGES
  try {
    const evalRes = CampaignEngine.evaluateCartCampaigns([], 4600, 'merch_001');
    assert(
      Boolean(evalRes.campaignNudge) && evalRes.campaignNudge.gap === 400,
      "Campaign engine server-side calculated threshold gap (₹400 away from unlocking ₹500 off)"
    );
  } catch (err) {
    assert(false, `Campaign threshold nudge test failed: ${err.message}`);
  }

  // TEST 4: SHOPPING MISSION EXECUTION
  try {
    const travelRes = await AgentPlanner.executePlannerLoop("Find me a travel backpack and accessories");
    assert(
      travelRes.products.length > 0 && travelRes.products[0].name.includes('Backpack'),
      "Shopping Mission 'Travel Essentials' correctly returned TravelPro Business Backpack"
    );
  } catch (err) {
    assert(false, `Shopping mission test failed: ${err.message}`);
  }

  // TEST 5: DYNAMIC WORKSPACE BUNDLE GENERATION
  try {
    const setupRes = await AgentPlanner.executePlannerLoop("Build me a work setup under 30000");
    assert(
      Boolean(setupRes.bundle) && setupRes.bundle.savings > 0,
      "Dynamic Workspace Bundle constructed productivity suite with verified bundle savings"
    );
  } catch (err) {
    assert(false, `Workspace bundle test failed: ${err.message}`);
  }

  console.log("\n==================================================");
  console.log(`SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runPhase5PublicLaunchTests();
