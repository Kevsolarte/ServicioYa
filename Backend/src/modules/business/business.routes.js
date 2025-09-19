const router = require("express").Router();
const { authRequired } = require("../../middlewares/auth");
const {
    postBusiness,
    getMyBusinesses,
    putBusiness,
    deleteBusinessCtrl,
    getPublicBusinesses,
    getBusinessPublic
} = require("./business.controller");

// 👇 PÚBLICOS
router.get("/", getPublicBusinesses);        // listar negocios (catálogo público)
router.get("/:id", getBusinessPublic);

router.post("/", authRequired, postBusiness);       // crear negocio
router.get("/me", authRequired, getMyBusinesses);   // listar negocios del usuario
router.put("/:id", authRequired, putBusiness);      // actualizar negocio
router.delete("/:id", authRequired, deleteBusinessCtrl); // desactivar negocio

module.exports = router;
