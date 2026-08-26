// Centralized Production API Client for Nexora Infrastructure
// Resolves production base URL, handles retries, timeout, cold-start detection, and error normalization.

const VITE_API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://nexora-backend.onrender.com' : '');

export function getApiUrl(path) {
  if (!path) return VITE_API_URL;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${VITE_API_URL}${cleanPath}`;
}

export class ApiError extends Error {
  constructor(message, code = 'API_ERROR', status = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function request(path, options = {}) {
  const url = getApiUrl(path);
  const timeoutMs = options.timeout || 12000; // 12-second max timeout
  const retries = options.retries !== undefined ? options.retries : (options.method && options.method !== 'GET' ? 0 : 2);
  const delayMs = options.delayMs || 1000;

  const token = localStorage.getItem('nexora_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('nexora:server-warming', { detail: { warming: true, attempt: attempt + 1 } }));
      }
    }, 1800); // Trigger warming banner after 1.8s delay

    const requestTimer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timer);
      clearTimeout(requestTimer);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('nexora:server-warming', { detail: { warming: false } }));
      }

      const contentType = res.headers.get('content-type') || '';
      let data = {};
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { text };
      }

      if (!res.ok) {
        const errObj = data.error || {};
        throw new ApiError(
          errObj.message || data.message || `Request failed with status ${res.status}`,
          errObj.code || 'HTTP_ERROR',
          res.status,
          data
        );
      }

      return data;

    } catch (err) {
      clearTimeout(timer);
      clearTimeout(requestTimer);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('nexora:server-warming', { detail: { warming: false } }));
      }

      lastError = err;

      // Do not retry client 4xx errors or aborted POST requests
      if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
        throw err;
      }

      if (attempt < retries) {
        await new Promise(r => setTimeout(r, delayMs * Math.pow(1.5, attempt)));
      }
    }
  }

  if (lastError instanceof ApiError) throw lastError;

  throw new ApiError(
    lastError?.name === 'AbortError'
      ? 'Nexora cloud server took too long to respond. Retrying connection...'
      : (lastError?.message || 'Unable to connect to Nexora backend services.'),
    'NETWORK_ERROR',
    0,
    { originalError: lastError?.message }
  );
}

export const apiClient = {
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),
  post: (path, body = {}, options = {}) => request(path, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (path, body = {}, options = {}) => request(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body = {}, options = {}) => request(path, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
  getApiUrl
};
