export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:4000';

export function absUrl(u?: string) {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u;
  return u.startsWith('/') ? `${API_ORIGIN}${u}` : `${API_ORIGIN}/${u}`;
}
