const { registerMerchant, login } = require("./auth.service");

async function postRegister(req, res, next) {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) return res.status(400).json({ message: "Faltan campos" });
    const user = await registerMerchant({ email, password, fullName });
    res.status(201).json({ id: user.id, email: user.email, fullName: user.fullName, role: user.role });
  } catch (e) { next(e); }
}

async function postLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Faltan campos" });
    const data = await login({ email, password });
    res.json(data);
  } catch (e) { next(e); }
}

async function getMe(req, res) {
  res.json({ sub: req.user.sub, role: req.user.role });
}

module.exports = { postRegister, postLogin, getMe };
