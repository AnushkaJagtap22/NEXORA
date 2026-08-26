// Production API Base URL Resolver with Render Cold-Start Fallback
const VITE_API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://nexora-backend.onrender.com' : '');

export function getApiUrl(path) {
  if (!path) return VITE_API_URL;
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${VITE_API_URL}${cleanPath}`;
}

export async function fetchWithRetry(url, options = {}, retries = 2, delayMs = 1500) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok || i === retries) return res;
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}
