const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const env = require("../../config/env");
const { prisma } = require("../../config/db");

async function registerMerchant({ email, password, fullName }) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw Object.assign(new Error("Email ya registrado"), { status: 409 });
  const passwordHash = await argon2.hash(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, fullName }
  });
  return user;
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw Object.assign(new Error("Credenciales inválidas"), { status: 401 });
  const ok = await argon2.verify(user.passwordHash, password);
  if (!ok) throw Object.assign(new Error("Credenciales inválidas"), { status: 401 });

  const accessToken = jwt.sign({ sub: user.id, }, env.jwtSecret, { expiresIn: "1d" });
  return { accessToken, user: { id: user.id, email: user.email, fullName: user.fullName } };
}

module.exports = { registerMerchant, login };
