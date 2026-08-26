// Campaign Orchestrator with budget caps & auto-stop triggers

class CampaignOrchestrator {
  constructor(initialCampaigns = []) {
    this.campaigns = [...initialCampaigns];
    this.actionLogs = [];
  }

  getCampaigns() {
    return this.campaigns;
  }

  getCampaignById(id) {
    return this.campaigns.find(c => c.id === id);
  }

  createCampaign(campaignData) {
    const newCampaign = {
      id: `camp_${Date.now()}`,
      status: "ACTIVE",
      spentBudget: 0,
      convertedCount: 0,
      totalAttempted: 0,
      createdAt: new Date().toISOString(),
      ...campaignData
    };
    this.campaigns.unshift(newCampaign);
    return newCampaign;
  }

  toggleCampaignStatus(id, newStatus) {
    const campaign = this.getCampaignById(id);
    if (campaign) {
      campaign.status = newStatus;
    }
    return campaign;
  }

  /**
   * Executes a campaign nudge action with budget constraint checks
   */
  executeCampaignAction(campaignId, customerContext, offerCost = 150) {
    const campaign = this.getCampaignById(campaignId);
    if (!campaign) throw new Error("Campaign not found");

    if (campaign.status !== "ACTIVE") {
      return {
        status: "BLOCKED",
        reason: `Campaign ${campaign.title} is currently ${campaign.status}.`
      };
    }

    // Check budget limit
    if (campaign.spentBudget + offerCost > campaign.budget) {
      campaign.status = "AUTO_STOPPED";
      const logMsg = `Campaign auto-stopped: Budget ceiling reached (Spent ₹${campaign.spentBudget} + ₹${offerCost} > Cap ₹${campaign.budget})`;
      this.actionLogs.unshift({
        timestamp: new Date().toISOString(),
        campaignId,
        type: "AUTO_STOP_TRIGGERED",
        detail: logMsg
      });
      return {
        status: "AUTO_STOPPED",
        reason: logMsg
      };
    }

    // Deduct budget & record attempt
    campaign.spentBudget += offerCost;
    campaign.totalAttempted += 1;
    
    // Simulate conversion probability
    const converted = Math.random() < 0.65;
    if (converted) {
      campaign.convertedCount += 1;
    }

    const actionRecord = {
      id: `act_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      timestamp: new Date().toISOString(),
      campaignId,
      campaignTitle: campaign.title,
      customerEmail: customerContext.email || "customer@example.com",
      offerCost,
      converted,
      status: "EXECUTED",
      remainingBudget: campaign.budget - campaign.spentBudget
    };

    this.actionLogs.unshift(actionRecord);

    return {
      status: "EXECUTED",
      converted,
      actionRecord
    };
  }

  getActionLogs() {
    return this.actionLogs;
  }
}

module.exports = CampaignOrchestrator;
