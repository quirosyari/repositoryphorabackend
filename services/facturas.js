const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
class Facturas {
  constructor() {}
async Agregar(factura) {
  try {
    const PesoLibras = parseFloat(factura.PesoLibras);
    const CostoPorLibra = parseFloat(factura.CostoPorLibra);
    const ImpuestoUSD = parseFloat(factura.ImpuestoUSD || 0);

    const SubtotalUSD = PesoLibras * CostoPorLibra;
    const TotalUSD = SubtotalUSD + ImpuestoUSD;

    const resultado = await prisma.facturas.create({
      data: {
        PesoLibras,
        CostoPorLibra,
        TipoCambioDolar: parseFloat(factura.TipoCambioDolar),
        SubtotalUSD,
        ImpuestoUSD,
        TotalUSD,
        FechaFactura: factura.FechaFactura ? new Date(factura.FechaFactura) : new Date(),
        usuarios: { connect: { UsuarioId: parseInt(factura.UsuarioId) } },
        trackings: { connect: { TrackingId: parseInt(factura.TrackingId) } },
      },
      include: {
        usuarios: { select: { Nombre: true, Apellido: true } },
        trackings: { select: { NumeroTracking: true, Status: true } },
      },
    });

    return resultado;
  } catch (error) {
    console.error("No se pudo crear la factura debido al error:", error);
    return null;
  }
}
// ➤ Actualizar factura por ID
async Actualizar(idFactura, datosFactura) {
  let resultado;
  if (!idFactura || isNaN(idFactura)) {
    console.error("El ID de factura no es válido:", idFactura);
    return null;
  }

  try {
    resultado = await prisma.facturas.update({
      where: { FacturaId: parseInt(idFactura) },
      data: {
        PesoLibras: datosFactura.PesoLibras ?? 0,
        CostoPorLibra: datosFactura.CostoPorLibra ?? 0,
        TipoCambioDolar: datosFactura.TipoCambioDolar ?? 0,
        SubtotalUSD: datosFactura.SubtotalUSD ?? 0,
        ImpuestoUSD: datosFactura.ImpuestoUSD ?? 0,
        TotalUSD: datosFactura.TotalUSD ?? 0,
        FechaFactura: datosFactura.FechaFactura
          ? new Date(datosFactura.FechaFactura)
          : undefined,
        UsuarioId: datosFactura.UsuarioId
          ? parseInt(datosFactura.UsuarioId)
          : undefined,
        TrackingId: datosFactura.TrackingId
          ? parseInt(datosFactura.TrackingId)
          : undefined,
      },
    });
  } catch (error) {
    console.error(`No se pudo actualizar la factura ${idFactura}:`, error);
    return null;
  }

  return resultado;
}


  // ➤ Borrar factura por ID
  async Borrar(idFactura) {
    let resultado;
    try {
      resultado = await prisma.facturas.delete({
        where: { FacturaId: parseInt(idFactura) },
      });
    } catch (error) {
      console.error(`No se pudo borrar la factura ${idFactura}:`, error);
      return null;
    }
    return resultado;
  }
async Listar(idFactura) {
  try {
    return await prisma.facturas.findMany({
      where: idFactura ? { FacturaId: parseInt(idFactura) } : undefined,
      include: {
        usuarios: { select: { Nombre: true, Apellido: true } },
        trackings: { select: { NumeroTracking: true, Status: true } },
      },
      orderBy: { FechaFactura: 'desc' }
    });
  } catch (error) {
    console.error("Error al listar facturas:", error);
    return [];
  }
}
 
  async ListarPorUsuario(usuarioId) {
    try {
      return await prisma.facturas.findMany({
        where: { UsuarioId: parseInt(usuarioId) },
        include: {
          usuarios: { select: { Nombre: true, Apellido: true } },
          trackings: { select: { NumeroTracking: true, Status: true } },
        },
        orderBy: { FechaFactura: 'desc' },
      });
    } catch (error) {
      console.error(`Error al listar facturas para usuario ${usuarioId}:`, error);
      return [];
    }
  }
}

module.exports = Facturas;
