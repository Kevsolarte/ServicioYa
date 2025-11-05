// src/api/services.ts
import { http } from './http';

export type ServiceCategory =
  | 'ESTETICA'
  | 'SALUD_BIENESTAR'
  | 'TECNICO_HOGAR'
  | 'REPARACIONES';

export type Service = {
  id: string;
  businessId: string;
  name: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: ServiceCategory;
  imageUrl?: string | null;
};

export type CreateServicePayload = {
  businessId: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  category?: ServiceCategory;
};

// Lo que puedes cambiar de un servicio existente.
// (businessId NO se actualiza desde aquí)
export type UpdateServicePayload = Partial<{
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  category: ServiceCategory;
  isActive: boolean;
  imageUrl: string | null;
}>;

export async function listServicesByBusiness(
  businessId: string,
  category?: string
): Promise<Service[]> {
  const { data } = await http.get(`/services/business/${businessId}`, {
    params: category ? { category } : undefined,
  });
  return Array.isArray(data) ? data : [];
}

export async function getServiceById(id: string): Promise<Service> {
  const { data } = await http.get(`/services/${id}`);
  return data;
}

export async function createService(payload: CreateServicePayload): Promise<Service> {
  const { data } = await http.post('/services', payload);
  return data;
}

export async function updateService(
  id: string,
  payload: UpdateServicePayload
): Promise<Service> {
  const { data } = await http.put(`/services/${id}`, payload);
  return data;
}

export async function deleteService(id: string): Promise<{ message: string }> {
  const { data } = await http.delete(`/services/${id}`);
  return data;
}

/* OPCIONAL: si expusiste el endpoint de subida de imagen
export async function uploadServiceImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('image', file);
  const { data } = await http.post('/uploads/service', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  // asume que backend devuelve { url: "http://..." }
  return data.url;
}
*/
