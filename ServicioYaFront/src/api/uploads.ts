// src/api/uploads.ts
import { http } from './http';

/**
 * Sube una imagen de servicio y devuelve la URL pública.
 * Backend esperado: POST /api/uploads/service con form-data { image }
 * Respuesta esperada: { url: "http://..." }
 */
export async function uploadServiceImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('image', file);

  const { data } = await http.post('/api/uploads/service', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  // por si tu backend devuelve otra clave:
  return data?.url || data?.path || data?.imageUrl;
}
