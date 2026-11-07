// scripts/seed-admin.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt"); // si da lata en Windows, usa "bcryptjs"

const prisma = new PrismaClient();

// EDITA según tu schema:
const MODELO = "usuarios"; // "usuarios" si el model es "Usuarios"; "usuario" si es "Usuario"
const EMAIL = "alequiro18@hotmail.com"; // campo @unique
const PASS_TMP = "Admin123";            // temporal (la cambiará al entrar)
const ROL = "administradora";

async function main() {
  const hash = await bcrypt.hash(PASS_TMP, 10);

  const admin = await prisma[MODELO].upsert({
    where: { Email: EMAIL },              // usa el campo único
    update: { Rol: ROL },                 // si existe, promover rol
    create: {
      Nombre: "Alejandra",
      Apellido: "Quiros",
      SegundoApellido: "Matarrita",
      NumeroIdentificacion: "504120874",
      Email: EMAIL,
      Telefono: "84051307",
      Provincia: "San José",
      Canton: "Central",
      Distrito: "Catedral",
      Direccion: "Calle 123",
      PasswordHash: hash,                 // encriptado
      Rol: ROL,
    },
  });

  console.log("✅ Admin listo:", admin.Email);
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
