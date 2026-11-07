const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class HistorialCambios {
  async Agregar(cambio) {
    try {
      let usuarioId = cambio.UsuarioId ? parseInt(cambio.UsuarioId) : null;
      if (usuarioId !== null && isNaN(usuarioId)) {
        console.warn("UsuarioId inválido en cambio:", cambio.UsuarioId);
        usuarioId = null;
      }

      const valorAnterior = (typeof cambio.ValorAnterior === "object" && cambio.ValorAnterior !== null)
        ? JSON.stringify(cambio.ValorAnterior)
        : cambio.ValorAnterior;

      const valorNuevo = (typeof cambio.ValorNuevo === "object" && cambio.ValorNuevo !== null)
        ? JSON.stringify(cambio.ValorNuevo)
        : cambio.ValorNuevo;

      return await prisma.historialCambios.create({
        data: {
          TrackingId: isNaN(parseInt(cambio.TrackingId)) ? null : parseInt(cambio.TrackingId),
          UsuarioId: usuarioId,
          Entidad: cambio.Entidad || "Tracking",
          Campo: cambio.Campo,
          ValorAnterior: valorAnterior || null,
          ValorNuevo: valorNuevo || null,
          FechaCambio: new Date(),
        },
      });
    } catch (error) {
      console.error("❌ Error al registrar cambio en historial:", error);
      return null;
    }
  }

  async Listar(idHistorial) {
    try {
      if (idHistorial) {
        return await prisma.historialCambios.findMany({
          where: { CambioId: parseInt(idHistorial) },
        });
      } else {
        return await prisma.historialCambios.findMany({
          orderBy: { FechaCambio: "desc" },
        });
      }
    } catch (error) {
      console.error("❌ Error al listar historial de cambios:", error);
      return [];
    }
  }

  async ListarPorTracking(trackingId) {
    try {
      return await prisma.historialCambios.findMany({
  where: { TrackingId: parseInt(trackingId) },
  orderBy: { FechaCambio: "desc" },
  include: {
    usuarios: {
      select: {
        Nombre: true,    // mayúscula N
        Email: true      // nombre correcto para correo electrónico
      }
    }
  }
});
    } catch (error) {
      console.error("❌ Error al listar historial del tracking:", error);
      return [];
    }
  }
}

module.exports = new HistorialCambios();
