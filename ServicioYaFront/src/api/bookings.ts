import { http } from './http';

export type Booking = {
  id: string;
  businessId: string;
  serviceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  dateTimeStart: string;     // ISO
  dateTimeEnd?: string;      // ISO (si tu backend lo envía)
  status?: string;
  // a veces el backend “popula” el servicio:
  service?: { id: string; name: string; durationMinutes?: number; price?: number };
};


// rango YYYY-MM (from = primer día 00:00, to = primer día del mes siguiente 00:00)
export function monthRange(date: Date) {
  const from = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1, 0, 0, 0));
  const to   = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0));
  return { from: from.toISOString(), to: to.toISOString() };
}

export async function listBookings(businessId: string, fromISO: string, toISO: string): Promise<Booking[]> {
  const { data } = await http.get('/bookings', {
    params: { businessId, from: fromISO, to: toISO },
  });
  // tu backend devuelve array directo
  return Array.isArray(data) ? data : (data?.items ?? []);
}
export async function getAvailability(params: AvailabilityParams): Promise<string[]> {
  const { data } = await http.get('/bookings/availability', { params });

  // Normalizaciones por si tu backend cambia el formato
  if (Array.isArray(data)) {
    if (typeof data[0] === 'string') return data as string[];
    if (typeof data[0] === 'object' && data[0]?.dateTimeStart) {
      return (data as any[]).map((x) => x.dateTimeStart);
    }
  }
  if (data?.slots) return data.slots as string[];
  return [];
}
export type AvailabilityParams = {
  businessId: string;  // requerido por tu backend
  serviceId: string;
  day: string;         // YYYY-MM-DD
  openHour?: number;
  closeHour?: number;
};
export type CreateBookingPayload = {
  businessId: string;
  serviceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  dateTimeStart: string; // ISO
};
export async function createBooking(payload: CreateBookingPayload) {
  const { data } = await http.post('/bookings', payload);
  return data;
}