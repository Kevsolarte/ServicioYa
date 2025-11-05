import axios from 'axios';
import { getToken, clearToken } from '../lib/auth';

export const http = axios.create({
  baseURL: 'http://localhost:4000/api', // ajusta a tu caso
  timeout: 15000,
});

// 👉 agrega el Bearer automáticamente
http.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// (opcional) si el token caduca, limpiar sesión
http.interceptors.response.use(
  r => r,
  err => {
    if (err?.response?.status === 401) {
      clearToken();
      // opcional: window.location.assign('/login');
    }
    return Promise.reject(err);
  }
);
