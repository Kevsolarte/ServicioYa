const {
  createBookingPublic,
  listBookingsByBusiness,
  cancelBooking,
  getAvailability
} = require("./booking.service");

// Cliente: crear reserva (sin token)
async function postBooking(req, res, next) {
  try {
    const { businessId, serviceId, customerName, customerEmail, customerPhone, dateTimeStart } = req.body || {};

    // validaciones básicas de entrada
    if (!businessId || !serviceId || !customerName || !customerEmail || !dateTimeStart) {
      return res.status(400).json({ message: "businessId, serviceId, customerName, customerEmail y dateTimeStart son requeridos" });
    }

    const booking = await createBookingPublic({ businessId, serviceId, customerName, customerEmail, customerPhone, dateTimeStart });
    res.status(201).json(booking);
  } catch (err) { next(err); }
}

// Merchant: listar reservas por negocio (con rango opcional)
async function getBookings(req, res, next) {
  try {
    const ownerId = req.user.sub;
    const { businessId, from, to } = req.query || {};

    if (!businessId) return res.status(400).json({ message: "businessId es requerido" });

    const list = await listBookingsByBusiness(ownerId, { businessId, from, to });
    res.json(list);
  } catch (err) { next(err); }
}

// Merchant: cancelar reserva
async function deleteBooking(req, res, next) {
  try {
    const ownerId = req.user.sub;
    const { id } = req.params;
    const bk = await cancelBooking(ownerId, id);
    res.json({ message: "Reserva cancelada", booking: bk });
  } catch (err) { next(err); }
}

// Público: disponibilidad por día
async function getAvailabilityCtrl(req, res, next) {
  try {
    const { businessId, serviceId, day, openHour, closeHour } = req.query || {};
    if (!businessId || !serviceId || !day) {
      return res.status(400).json({ message: "businessId, serviceId y day (YYYY-MM-DD) son requeridos" });
    }
    const slots = await getAvailability({
      businessId,
      serviceId,
      dayISO: day,
      openHour: openHour ? Number(openHour) : undefined,
      closeHour: closeHour ? Number(closeHour) : undefined
    });
    res.json(slots);
  } catch (err) { next(err); }
}

module.exports = { postBooking, getBookings, deleteBooking, getAvailabilityCtrl };
