const router = require("express").Router();
const { authRequired } = require("../../middlewares/auth");
const {
    postService,
    getBusinessServices,
    putService,
    deleteServiceCtrl,
    getServicePublic
} = require("./service.controller");
router.get("/:id", getServicePublic); // detalle de servicio
router.get("/business/:businessId", getBusinessServices); // lista por negocio
// Crear servicio (merchant)
router.post("/", authRequired, postService);

// Listar servicios de un negocio (público)
router.get("/business/:businessId", getBusinessServices);

// Actualizar servicio (merchant)
router.put("/:id", authRequired, putService);

// Desactivar servicio (merchant)
router.delete("/:id", authRequired, deleteServiceCtrl);

module.exports = router;
