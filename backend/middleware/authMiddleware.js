const jwt = require('jsonwebtoken');
const db = require('../db/sqliteStore');

const JWT_SECRET = process.env.JWT_SECRET || 'nexora_production_jwt_secret_key_2026_super_secure';

function extractToken(req) {
  // 1. Try HttpOnly Cookie
  if (req.cookies && req.cookies.nexora_access_token) {
    return req.cookies.nexora_access_token;
  }
  // 2. Fallback to Authorization Header
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

function authenticateUser(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'UNAUTHORIZED_ACCESS_TOKEN_REQUIRED', message: 'No authentication token provided.' });
  }

  try {
    // Check if token exists in auth_tokens table and is not expired
    const row = db.prepare('SELECT user_id, expires_at FROM auth_tokens WHERE token = ?').get(token);
    if (!row) {
      return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Token is invalid or session has been revoked.' });
    }

    if (new Date(row.expires_at) < new Date()) {
      return res.status(401).json({ error: 'TOKEN_EXPIRED', message: 'Access token has expired. Please refresh token.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'TOKEN_VERIFICATION_FAILED', message: err.message });
  }
}

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'UNAUTHENTICATED' });
    }
    const role = req.user.role;
    const isAllowed = allowedRoles.includes(role) || (allowedRoles.includes('BUYER') && role === 'AI_BUYER');
    if (!isAllowed) {
      return res.status(403).json({ error: 'FORBIDDEN_ROLE_UNAUTHORIZED', requiredRoles: allowedRoles, currentRole: role });
    }
    next();
  };
}

function requireMerchantIsolation(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'UNAUTHENTICATED' });
  }

  if (req.user.role === 'ADMIN') {
    return next();
  }

  const userMerchantId = req.user.merchantId;
  const targetMerchantId = req.query.merchantId || req.params.merchantId || req.body.merchantId || 'merch_001';

  if (userMerchantId && targetMerchantId && userMerchantId !== targetMerchantId) {
    return res.status(403).json({ error: 'MULTI_TENANT_IDOR_VIOLATION', message: 'Access restricted to authorized tenant.' });
  }
  next();
}

module.exports = {
  JWT_SECRET,
  authenticateUser,
  requireRole,
  requireMerchantIsolation
};
