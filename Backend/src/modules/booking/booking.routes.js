const router = require("express").Router();
const { authRequired } = require("../../middlewares/auth");
const { postBooking, getBookings, deleteBooking, getAvailabilityCtrl } = require("./booking.controller");

// Público
router.post("/", postBooking); // crear reserva (cliente)
router.get("/availability", getAvailabilityCtrl); // ver slots disponibles (cliente)

// Merchant
router.get("/", authRequired, getBookings);       // listar reservas por negocio (owner)
router.delete("/:id", authRequired, deleteBooking); // cancelar (owner)

module.exports = router;
