function runSyntheticExperiment() {
  const totalSessions = 1000;

  // Baseline Group: Normal discovery, standard cart, no AI negotiation/upsell
  const baselineConversions = 84;
  const baselineAOV = 2840;
  const baselineRevenue = baselineConversions * baselineAOV; // ₹2,38,560

  // AI-Assisted Group: Mistral agent, tool loop, recommendations, bounded upsell, policy-bounded negotiation
  const aiConversions = 101;
  const aiAOV = 3120;
  const aiRevenue = aiConversions * aiAOV; // ₹3,15,120

  const conversionUplift = (((aiConversions - baselineConversions) / baselineConversions) * 100).toFixed(1);
  const aovUplift = (((aiAOV - baselineAOV) / baselineAOV) * 100).toFixed(1);
  const incrementalRevenue = aiRevenue - baselineRevenue;

  return {
    experimentType: 'SYNTHETIC EXPERIMENT',
    disclaimer: 'Simulated controlled experiment demonstrating potential revenue impact.',
    sessionsCount: totalSessions,
    baselineGroup: {
      sessions: totalSessions,
      conversions: baselineConversions,
      conversionRate: '8.4%',
      aov: baselineRevenue / baselineConversions,
      totalRevenue: baselineRevenue
    },
    aiGroup: {
      sessions: totalSessions,
      conversions: aiConversions,
      conversionRate: '10.1%',
      aov: aiRevenue / aiConversions,
      totalRevenue: aiRevenue
    },
    calculatedUplift: {
      conversionUpliftPct: `+${conversionUplift}%`,
      aovUpliftPct: `+${aovUplift}%`,
      incrementalRevenue: incrementalRevenue,
      incrementalRevenueFormatted: `+₹${incrementalRevenue.toLocaleString()}`
    }
  };
}

module.exports = {
  runSyntheticExperiment
};
