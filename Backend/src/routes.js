const router = require("express").Router();

router.get("/health", (_req, res) => res.json({ ok: true }));

// módulos
router.use("/auth", require("./modules/auth/auth.routes"));
router.use("/businesses", require("./modules/business/business.routes"));
router.use("/services", require("./modules/service/service.routes"));
router.use("/bookings", require("./modules/booking/booking.routes"));





module.exports = router;
