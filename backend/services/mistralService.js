const { buildIntentPrompt } = require('../prompts/intentAgent');
const ProductRepository = require('../db/repositories/ProductRepository');

class MistralService {
  static async queryMistralLLM(prompt, timeoutMs = 2500) {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      return { success: false, reason: 'MISTRAL_API_KEY_NOT_CONFIGURED' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'mistral-tiny',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (!response.ok) {
        return { success: false, reason: `HTTP_${response.status}` };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      return { success: true, content, usage: data.usage || {} };
    } catch (err) {
      clearTimeout(timeoutId);
      return { success: false, reason: err.name === 'AbortError' ? 'TIMEOUT_EXCEEDED' : err.message };
    }
  }

  static async parseSemanticIntent(userInput) {
    const prompt = buildIntentPrompt(userInput);
    const llmRes = await this.queryMistralLLM(prompt);

    if (llmRes.success && llmRes.content) {
      try {
        const jsonMatch = llmRes.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return { success: true, intent: parsed, source: 'MISTRAL_AI' };
        }
      } catch (e) {}
    }

    // Deterministic Fallback if Mistral is offline or times out
    return this.deterministicIntentFallback(userInput);
  }

  static deterministicIntentFallback(userInput) {
    const msg = userInput.toLowerCase();
    let category = 'ALL';
    let maxPrice = null;

    if (msg.includes('laptop') || msg.includes('coding') || msg.includes('macbook')) category = 'Laptops';
    else if (msg.includes('headphone') || msg.includes('audio') || msg.includes('sound')) category = 'Audio';
    else if (msg.includes('keyboard') || msg.includes('mouse') || msg.includes('desk')) category = 'Keyboards';
    else if (msg.includes('travel') || msg.includes('bag') || msg.includes('backpack') || msg.includes('trip')) category = 'Accessories';
    else if (msg.includes('wearable') || msg.includes('watch')) category = 'Wearables';
    else if (msg.includes('camera') || msg.includes('webcam')) category = 'Cameras';

    // Parse exact numerical budget regex safely with boundary checks
    const numbers = msg.match(/\b\d+[\d,]*\b/g);
    if (numbers && numbers.length > 0) {
      const parsedNums = numbers.map(n => parseInt(n.replace(/,/g, ''), 10)).filter(n => n >= 100);
      if (parsedNums.length > 0) {
        maxPrice = Math.max(...parsedNums);
      }
    }

    return {
      success: true,
      intent: {
        intent: 'product_discovery',
        confidence: 0.85,
        category,
        maxPrice,
        useCase: msg.includes('business') ? 'business_travel' : 'general',
        durationDays: msg.includes('3-day') ? 3 : null,
        requestedTools: ['search_catalog', 'check_inventory', 'recommend_products']
      },
      source: 'DETERMINISTIC_FALLBACK'
    };
  }
}

module.exports = MistralService;
