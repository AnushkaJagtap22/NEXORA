// Sliding Window Rate Limiter Middleware for Nexora SaaS API
const rateLimitMap = new Map();

function createRateLimiter({ windowMs = 60000, maxRequests = 30, keyPrefix = 'rl' }) {
  return (req, res, next) => {
    const clientKey = `${keyPrefix}:${req.ip || '127.0.0.1'}`;
    const now = Date.now();

    if (!rateLimitMap.has(clientKey)) {
      rateLimitMap.set(clientKey, []);
    }

    const timestamps = rateLimitMap.get(clientKey);
    // Filter timestamps within window
    const validTimestamps = timestamps.filter(ts => now - ts < windowMs);

    if (validTimestamps.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded (${maxRequests} requests per ${Math.round(windowMs / 1000)}s). Please slow down.`,
        retryAfterMs: windowMs - (now - validTimestamps[0]),
        requestId: req.requestId
      });
    }

    validTimestamps.push(now);
    rateLimitMap.set(clientKey, validTimestamps);
    next();
  };
}

const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 10, keyPrefix: 'auth' });
const aiLimiter = createRateLimiter({ windowMs: 60 * 1000, maxRequests: 30, keyPrefix: 'ai' });
const checkoutLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 10, keyPrefix: 'checkout' });
const generalLimiter = createRateLimiter({ windowMs: 60 * 1000, maxRequests: 100, keyPrefix: 'gen' });

module.exports = {
  createRateLimiter,
  authLimiter,
  aiLimiter,
  checkoutLimiter,
  generalLimiter
};
