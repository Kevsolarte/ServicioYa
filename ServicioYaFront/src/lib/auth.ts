const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';

export function setToken(token: string) { localStorage.setItem(TOKEN_KEY, token); }
export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }
export function setUser(user: unknown) { localStorage.setItem(USER_KEY, JSON.stringify(user)); }
export function getUser<T = unknown>(): T | null { const raw = localStorage.getItem(USER_KEY); return raw ? JSON.parse(raw) as T : null; }
