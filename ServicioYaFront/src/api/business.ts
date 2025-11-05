import { http } from './http';

export type Business = {
  id: string;
  displayName: string;
  description?: string;
  phone?: string;
  email?: string;
  timezone: string;
  isActive: boolean;
};

export type CreateBusinessPayload = {
  displayName: string;
  description?: string;
  phone?: string;
  email?: string;
  timezone: string; // IANA, ej: America/Caracas
};

export async function listMyBusinesses(): Promise<Business[]> {
  const { data } = await http.get('/businesses/me');
  // Soporta tanto array directo como {items: []}
  if (Array.isArray(data)) return data;
  if (data?.items && Array.isArray(data.items)) return data.items;
  console.log('data', data);
  
  return [];
}

export async function createBusiness(payload: CreateBusinessPayload): Promise<Business> {
  const { data } = await http.post('/businesses', payload);
  return data;
}

export type PublicBusiness = {
  id: string;
  displayName: string;
  description?: string;
  phone?: string;
  email?: string;
  timezone?: string;
  isActive?: boolean;
};

export async function listPublicBusinesses(params: {
  q?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<PublicBusiness[]> {
  const { data } = await http.get('/businesses', { params });
  // tu backend puede responder [] o {items: []}
  if (Array.isArray(data)) return data;
  return data?.items ?? [];
}

export async function getBusinessById(id: string): Promise<PublicBusiness> {
  const { data } = await http.get(`/businesses/${id}`); // público
  return data;
}