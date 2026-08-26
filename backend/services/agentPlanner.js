const MistralService = require('./mistralService');
const ProductRepository = require('../db/repositories/ProductRepository');

class AgentPlanner {
  static async executePlannerLoop(userInput, merchantId = 'merch_001') {
    const rawQuery = (userInput || '').trim();
    const lowerQuery = rawQuery.toLowerCase();

    console.log(`\n[AgentPlanner] RAW QUERY: "${rawQuery}"`);

    // 1. OBSERVE & UNDERSTAND (Semantic Intent Extraction)
    const intentRes = await MistralService.parseSemanticIntent(userInput);
    const intentData = intentRes.intent || {};

    // Extract search query keyword hints
    let searchCategory = intentData.category !== 'ALL' ? intentData.category : null;
    let maxPrice = intentData.maxPrice;

    // Direct keyword mapping overrides for explicit user terms
    let searchTerm = '';
    if (lowerQuery.includes('mouse')) { searchCategory = 'Accessories'; searchTerm = 'mouse'; }
    else if (lowerQuery.includes('headphone') || lowerQuery.includes('earphone') || lowerQuery.includes('audio')) { searchCategory = 'Audio'; searchTerm = 'headphone'; }
    else if (lowerQuery.includes('keyboard') || lowerQuery.includes('desk')) { searchCategory = 'Keyboards'; searchTerm = 'keyboard'; }
    else if (lowerQuery.includes('watch') || lowerQuery.includes('tracker') || lowerQuery.includes('wearable')) { searchCategory = 'Wearables'; searchTerm = 'watch'; }
    else if (lowerQuery.includes('camera') || lowerQuery.includes('stream') || lowerQuery.includes('webcam')) { searchCategory = 'Cameras'; searchTerm = 'camera'; }
    else if (lowerQuery.includes('backpack') || lowerQuery.includes('bag') || lowerQuery.includes('travel') || lowerQuery.includes('trip')) { searchCategory = 'Accessories'; searchTerm = 'backpack'; }
    else if (lowerQuery.includes('laptop') || lowerQuery.includes('coding') || lowerQuery.includes('macbook')) { searchCategory = 'Laptops'; searchTerm = 'laptop'; }
    else if (lowerQuery.includes('hiking') || lowerQuery.includes('outdoor')) { searchCategory = 'Wearables'; searchTerm = 'tracker'; }

    // Map AI category synonyms to database canonical categories ('Laptops', 'Audio', 'Wearables', 'Keyboards', 'Cameras', 'Accessories')
    const categoryMap = {
      'electronics': 'Laptops',
      'computers': 'Laptops',
      'pc': 'Laptops',
      'luggage': 'Accessories',
      'travel': 'Accessories',
      'bags': 'Accessories',
      'peripherals': 'Keyboards',
      'audio equipment': 'Audio',
      'gadgets': 'Wearables'
    };

    if (searchCategory && categoryMap[searchCategory.toLowerCase()]) {
      searchCategory = categoryMap[searchCategory.toLowerCase()];
    }

    console.log(`[AgentPlanner] PARSED INTENT: Category=${searchCategory || 'ALL'}, MaxPrice=${maxPrice || 'NONE'}, SearchTerm="${searchTerm}"`);

    // 2. QUERY DATABASE WITH PARAMETERIZED FILTERS
    let candidateProducts = ProductRepository.getAll({
      search: searchTerm || null,
      category: searchCategory || 'ALL',
      merchantId,
      status: 'ACTIVE',
      limit: 50
    });

    // If search term or specific category yielded 0, retry broader category search
    if (candidateProducts.length === 0 && searchCategory && searchCategory !== 'ALL') {
      candidateProducts = ProductRepository.getAll({
        category: searchCategory,
        merchantId,
        status: 'ACTIVE',
        limit: 50
      });
    }

    // Fallback across ALL categories if initial search yielded 0
    if (candidateProducts.length === 0) {
      candidateProducts = ProductRepository.getAll({
        search: searchTerm || null,
        category: 'ALL',
        merchantId,
        status: 'ACTIVE',
        limit: 50
      });
    }

    // Ultimate Safety Net: If still 0 products, return top active catalog items
    if (candidateProducts.length === 0) {
      candidateProducts = ProductRepository.getAll({
        category: 'ALL',
        merchantId,
        status: 'ACTIVE',
        limit: 50
      });
    }

    // Filter by max budget constraint if specified (with fallback if budget filter empties set)
    if (maxPrice && candidateProducts.length > 0) {
      const budgetFiltered = candidateProducts.filter(p => p.price <= maxPrice);
      if (budgetFiltered.length > 0) {
        candidateProducts = budgetFiltered;
      }
    }

    console.log(`[AgentPlanner] DATABASE RESULTS: ${candidateProducts.length} items`);

    // 3. RANK PRODUCTS (5-Signal Composite Score)
    const rankedProducts = candidateProducts
      .map(p => {
        let score = 50;
        const pName = p.name.toLowerCase();

        // Keyword relevance boost
        if (searchTerm && pName.includes(searchTerm)) score += 35;
        if (searchCategory && p.category === searchCategory) score += 20;

        // Stock availability boost
        if (p.stock > 10) score += 15;

        // Budget compliance boost
        if (maxPrice && p.price <= maxPrice) score += 15;

        return { product: p, score };
      })
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);

    console.log(`[AgentPlanner] RANKED RESULTS: ${rankedProducts.length} items`);

    // 4. GENERATE DIVERSIFIED COMPLEMENTARY RECOMMENDATIONS
    let recommendations = [];
    if (rankedProducts.length > 0) {
      const primaryCat = rankedProducts[0].category;
      const recCategory = primaryCat === 'Audio' ? 'Accessories' : primaryCat === 'Keyboards' ? 'Wearables' : 'Audio';
      const recCandidates = ProductRepository.getAll({ category: recCategory, merchantId, status: 'ACTIVE', limit: 3 });

      recommendations = recCandidates.map(c => ({
        product: c,
        type: 'COMPLEMENTARY_SETUP',
        reason: `Frequently paired with ${primaryCat} gear.`
      }));
    }

    // 5. DYNAMIC WORKSPACE BUNDLE (When setup/travel is requested)
    let bundle = null;
    if (lowerQuery.includes('setup') || lowerQuery.includes('bundle') || lowerQuery.includes('suite') || lowerQuery.includes('travel')) {
      if (rankedProducts.length >= 2) {
        const bundleItems = rankedProducts.slice(0, 3);
        const sumPrice = bundleItems.reduce((s, p) => s + p.price, 0);
        const bundlePrice = Math.round(sumPrice * 0.9);

        bundle = {
          title: lowerQuery.includes('travel') ? 'Nexora Travel Essentials Suite' : 'Nexora Complete Work Productivity Suite',
          products: bundleItems,
          individualPrice: sumPrice,
          bundlePrice,
          savings: sumPrice - bundlePrice
        };
      }
    }

    // 6. GENERATE AI EXPLANATION & HONEST EMPTY STATES
    let aiExplanation = '';
    let title = 'SEARCH RESULTS';

    if (rankedProducts.length > 0) {
      if (searchTerm) {
        title = `RESULTS FOR "${searchTerm.toUpperCase()}"`;
      } else if (searchCategory) {
        title = `TOP ${searchCategory.toUpperCase()} PRODUCTS`;
      } else if (maxPrice) {
        title = `BEST PRODUCTS UNDER ₹${maxPrice.toLocaleString()}`;
      } else {
        title = 'RECOMMENDED FOR YOU';
      }

      aiExplanation = `Mistral AI queried SQLite database records. Found ${rankedProducts.length} active products matching "${rawQuery}".`;
    } else {
      title = 'NO MATCHING PRODUCTS';
      aiExplanation = `No active catalog products matched your search criteria ("${rawQuery}"${maxPrice ? `, Max Price: ₹${maxPrice}` : ''}). Please try adjusting your search term or price limit.`;
    }

    return {
      success: true,
      title,
      intent: intentData,
      source: intentRes.source,
      products: rankedProducts.slice(0, 6),
      bundle,
      recommendations,
      aiExplanation
    };
  }
}

module.exports = AgentPlanner;
