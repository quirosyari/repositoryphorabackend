const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { enviarCorreoActualizacion, enviarCorreoNuevoTracking } = require('./correo');

class Trackings {
  constructor() {}

// ➤ Crear un tracking
async Agregar(tracking) {
  let resultado;
  try {
    resultado = await prisma.trackings.create({
      data: {
        NumeroTracking: tracking.NumeroTracking,
        Status: tracking.Status || "Pendiente",
        FechaRegistro: new Date(),
        Ubicacion: tracking.Ubicacion || null,
        Observaciones: tracking.Observaciones || null,
        FechaEntregaCostaRica: tracking.FechaEntregaCostaRica 
          ? new Date(tracking.FechaEntregaCostaRica) 
          : null,
        usuarios: {
          connect: { UsuarioId: parseInt(tracking.UsuarioId) }
        }
      }
    });

    // ✅ Enviar correo de nuevo tracking
    if (resultado) {
      try {
        const usuario = await prisma.usuarios.findUnique({
          where: { UsuarioId: parseInt(tracking.UsuarioId) }
        });

        if (usuario && usuario.Email) {
          await enviarCorreoNuevoTracking(
            usuario.Email,
            usuario.Nombre,
            resultado.NumeroTracking
          );
        }
      } catch (errorCorreo) {
        console.error("⚠️ Error al enviar correo de nuevo tracking:", errorCorreo);
      }
    }

  } catch (error) {
    console.error(`No se pudo insertar el tracking debido al error:`, error);
    return null;
  }

  return resultado;
}
async Actualizar(idTracking, datosTracking, usuarioId) {
  let resultado;

  // Validar ID del tracking
  if (!idTracking || isNaN(idTracking)) {
    console.error("❌ El ID del tracking no es válido:", idTracking);
    return null;
  }

  try {
    // 1. Obtener el tracking actual junto con el usuario
    const trackingExistente = await prisma.trackings.findUnique({
      where: { TrackingId: parseInt(idTracking) },
      include: { usuarios: true }
    });

    if (!trackingExistente) {
      console.error(`❌ No se encontró el tracking con ID ${idTracking}`);
      return null;
    }

    // 2. Actualizar el tracking
    resultado = await prisma.trackings.update({
      where: { TrackingId: parseInt(idTracking) },
      data: {
        Status: datosTracking.Status || trackingExistente.Status,
        Ubicacion: datosTracking.Ubicacion || trackingExistente.Ubicacion,
        Observaciones: datosTracking.Observaciones || trackingExistente.Observaciones,
        FechaEntregaCostaRica: datosTracking.FechaEntregaCostaRica 
          ? new Date(datosTracking.FechaEntregaCostaRica) 
          : trackingExistente.FechaEntregaCostaRica
      },
    });

    // 3. Comparar campos y registrar historial de cambios
    const campos = ["Status", "Ubicacion", "Observaciones", "FechaEntregaCostaRica"];
    for (const campo of campos) {
      const valorAnterior = trackingExistente[campo];
      const valorNuevo = resultado[campo];

      // Convertir fechas a string para comparación
      const anteriorStr = valorAnterior instanceof Date ? valorAnterior.toISOString() : valorAnterior;
      const nuevoStr = valorNuevo instanceof Date ? valorNuevo.toISOString() : valorNuevo;

      if (anteriorStr !== nuevoStr) {
        await prisma.historialCambios.create({
          data: {
            TrackingId: parseInt(idTracking),
            UsuarioId: usuarioId ? parseInt(usuarioId) : null,
            Campo: campo,
            ValorAnterior: anteriorStr ? String(anteriorStr) : null,
            ValorNuevo: nuevoStr ? String(nuevoStr) : null,
            FechaCambio: new Date(),
            Entidad: "Tracking"
          }
        });
      }
    }

    // 4. Enviar correo solo si el estado cambió
    if (
      datosTracking.Status &&
      datosTracking.Status !== trackingExistente.Status &&
      trackingExistente.usuarios?.Email
    ) {
      await enviarCorreoActualizacion(
        trackingExistente.usuarios.Email,
        trackingExistente.NumeroTracking,
        datosTracking.Status
      );
    }

  } catch (error) {
    console.error(`❌ Error al actualizar el tracking ${idTracking}:`, error);
    return null;
  }

  return resultado;
}


  async Borrar(idTracking) {
    let resultado;
    try {
      resultado = await prisma.trackings.delete({
        where: { TrackingId: parseInt(idTracking) },
      });
    } catch (error) {
      console.error(`No se pudo borrar el tracking ${idTracking}:`, error);
      return null;
    }
    return resultado;
  }
 // ➤ Listar trackings
async Listar(idTracking) {
  let trackings;
  try {
    if (idTracking === undefined) {
      trackings = await prisma.trackings.findMany({
        include: { 
          usuarios: {
            select: {
              Nombre: true,
              Apellido:true // ✅ Solo traemos el nombre del usuario
            }
          }
        },
      });
    } else {
      trackings = await prisma.trackings.findMany({
        where: { TrackingId: parseInt(idTracking) },
        include: { 
          usuarios: {
            select: {
              Nombre: true,
              Apellido: true  // ✅ Siempre traer ambos
            }
          }
        },
      });
    }
  } catch (error) {
    console.error(`Error al listar trackings: ${error}`);
    return [];
  }
  return trackings;
}

async ListarPorCliente(clienteId) {
  let trackings;
  try {
    trackings = await prisma.trackings.findMany({
      where: { UsuarioId: parseInt(clienteId) },
      orderBy: { FechaRegistro: 'desc' }
    });
  } catch (error) {
    console.error(`Error al listar trackings del cliente ${clienteId}: ${error}`);
    return [];
  }
  
  return trackings;
}
}

module.exports = Trackings;
