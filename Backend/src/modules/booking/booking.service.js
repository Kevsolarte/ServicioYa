const { prisma } = require("../../config/db");

// util: sumar minutos a un Date
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

// chequear solape contra reservas NO canceladas
async function hasOverlap({ businessId, start, end }) {
  const overlap = await prisma.booking.findFirst({
    where: {
      businessId,
      status: { not: "CANCELLED" },
      AND: [
        { dateTimeStart: { lt: end } },
        { dateTimeEnd:   { gt: start } }
      ]
    },
    select: { id: true }
  });
  return Boolean(overlap);
}

// crear reserva pública (cliente)
async function createBookingPublic(payload) {
  const { businessId, serviceId, customerName, customerEmail, customerPhone, dateTimeStart } = payload;

  // validar negocio + servicio existentes y activos + que el servicio pertenezca al negocio
  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId, isActive: true },
    include: { business: { select: { id: true, isActive: true } } }
  });
  if (!service || !service.business?.isActive) {
    const e = new Error("Negocio o servicio no disponible");
    e.status = 404; throw e;
  }

  const start = new Date(dateTimeStart);
  if (isNaN(start.getTime())) {
    const e = new Error("dateTimeStart inválido (usa ISO 8601)");
    e.status = 400; throw e;
  }
  const end = addMinutes(start, service.durationMinutes);

  const conflict = await hasOverlap({ businessId, start, end });
  if (conflict) {
    const e = new Error("Horario no disponible");
    e.status = 409; throw e;
  }

  return prisma.booking.create({
    data: {
      businessId,
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      dateTimeStart: start,
      dateTimeEnd: end,
      status: "PENDING"
    }
  });
}

// listar reservas del merchant por rango de fechas
async function listBookingsByBusiness(ownerId, { businessId, from, to }) {
  const biz = await prisma.business.findFirst({ where: { id: businessId, ownerId } });
  if (!biz) { const e = new Error("Negocio no encontrado o no autorizado"); e.status = 404; throw e; }

  const where = {
    businessId,
    ...(from && to ? { dateTimeStart: { gte: new Date(from) }, dateTimeEnd: { lte: new Date(to) } } : {})
  };

  return prisma.booking.findMany({
    where,
    orderBy: { dateTimeStart: "asc" },
    include: {
      service: { select: { name: true, durationMinutes: true, price: true } }
    }
  });
}

// cancelar una reserva (merchant)
async function cancelBooking(ownerId, bookingId) {
  // validar ownership a través del negocio de la reserva
  const bk = await prisma.booking.findFirst({
    where: { id: bookingId },
    include: { business: { select: { ownerId: true } } }
  });
  if (!bk || bk.business.ownerId !== ownerId) {
    const e = new Error("Reserva no encontrada o no autorizada");
    e.status = 404; throw e;
  }
  if (bk.status === "CANCELLED") return bk;

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" }
  });
}

function generateDailySlots({ dayISO, openHour = 9, closeHour = 18, slotMinutes }) {
  const day = new Date(`${dayISO}T00:00:00`);
  const start = new Date(day); start.setHours(openHour, 0, 0, 0);
  const endDay = new Date(day); endDay.setHours(closeHour, 0, 0, 0);

  const slots = [];
  for (let t = new Date(start); t < endDay; t = addMinutes(t, slotMinutes)) {
    slots.push(new Date(t));
  }
  return slots;
}

// listar slots disponibles de un día para un negocio+servicio
async function getAvailability({ businessId, serviceId, dayISO, openHour = 9, closeHour = 18 }) {
  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId, isActive: true },
    select: { durationMinutes: true }
  });
  if (!service) { const e = new Error("Servicio no disponible"); e.status = 404; throw e; }

  const slotMinutes = service.durationMinutes;
  const slots = generateDailySlots({ dayISO, openHour, closeHour, slotMinutes });

  // traer reservas del día
  const dayStart = new Date(`${dayISO}T00:00:00`);
  const dayEnd = new Date(`${dayISO}T23:59:59.999`);

  const bookings = await prisma.booking.findMany({
    where: {
      businessId,
      status: { not: "CANCELLED" },
      dateTimeStart: { lt: dayEnd },
      dateTimeEnd:   { gt: dayStart }
    },
    select: { dateTimeStart: true, dateTimeEnd: true }
  });

  const free = slots.filter((s) => {
    const e = addMinutes(s, slotMinutes);
    return !bookings.some(b => s < b.dateTimeEnd && e > b.dateTimeStart);
  });

  return free;
}

module.exports = {
  createBookingPublic,
  listBookingsByBusiness,
  cancelBooking,
  getAvailability
};
