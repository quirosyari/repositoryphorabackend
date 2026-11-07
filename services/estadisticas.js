const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class Estadisticas {
  async trackingsPorEstado() {
    try {
      const resumen = await prisma.trackings.groupBy({
        by: ['Status'],
        _count: {
          Status: true
        }
      });

      return resumen.map(r => ({
        status: r.Status,
        cantidad: r._count.Status
      }));
    } catch (error) {
      console.error("Error en trackingsPorEstado:", error);
      return [];
    }
  }

  // 🔜 Aquí puedes agregar más como: trackingsPorDia(), entregasPorProvincia(), etc.
}

module.exports = Estadisticas;
