const router = require("express").Router();
const { postRegister, postLogin, getMe } = require("./auth/auth.controller");
const { authRequired } = require("../../middlewares/auth");

router.post("/register", postRegister);  // solo merchants
router.post("/login", postLogin);
router.get("/me", authRequired, getMe);

module.exports = router;
