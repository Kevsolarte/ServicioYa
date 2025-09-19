const env = require("./config/env");
const app = require("./app");
const { prisma } = require("./config/db");

app.listen(env.port, async () => {
  try {
    await prisma.$connect();
    console.log(`✅ API corriendo en http://localhost:${env.port}`);
  } catch (e) {
    console.error("❌ Error conectando a DB:", e);
    process.exit(1);
  }
});
