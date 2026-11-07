const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const existe = await prisma.usuarios.findUnique({
    where: { NumeroIdentificacion: "504120874" }
  });

  if (!existe) {
    await prisma.usuarios.create({
      data: {
        Nombre: "Alejandra",
        Apellido: "Quiros",
        SegundoApellido: "Matarrita",
        NumeroIdentificacion: "504120874",
        Email: "alequiro18@hotmail.com",
        Telefono: "84051307",
        Provincia: "San José",
        Canton: "Central",
        Distrito: "Catedral",
        Direccion: "Calle 123",
        PasswordHash: "Admin123", // sin encriptar
        Rol: "administradora"
      }
    });
    console.log("✅ Usuario Alejandra creado");
  } else {
    console.log("ℹ️ Usuario Alejandra ya existe");
  }
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
