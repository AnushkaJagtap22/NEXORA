// Production API Base URL Resolver
const VITE_API_URL = import.meta.env.VITE_API_URL || '';

export function getApiUrl(path) {
  if (!path) return VITE_API_URL;
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${VITE_API_URL}${cleanPath}`;
}
