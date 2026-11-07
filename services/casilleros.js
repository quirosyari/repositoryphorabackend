const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class Casilleros {
  constructor() {}

  async Agregar(casillero) {
    let resultado;
    try {
      resultado = await prisma.casilleros.create({
        data: {
          ClienteId: parseInt(casillero.ClienteId),
          CodigoCasillero: casillero.CodigoCasillero,
        },
      });
    } catch (error) {
      console.error(`No se pudo insertar el casillero debido al error:`, error);
      return null;
    }
    return resultado;
  }

  // ➤ Actualizar casillero
  async Actualizar(idCasillero, datosCasillero) {
    let resultado;
    if (!idCasillero || isNaN(idCasillero)) {
      console.error("El ID del casillero no es válido:", idCasillero);
      return null;
    }
    try {
      resultado = await prisma.casilleros.update({
        where: { CasilleroId: parseInt(idCasillero) },
        data: {
          CodigoCasillero: datosCasillero.CodigoCasillero,
        },
      });
    } catch (error) {
      console.error(`No se pudo actualizar el casillero ${idCasillero}:`, error);
      return null;
    }
    return resultado;
  }

  // ➤ Borrar casillero
  async Borrar(idCasillero) {
    let resultado;
    try {
      resultado = await prisma.casilleros.delete({
        where: { CasilleroId: parseInt(idCasillero) },
      });
    } catch (error) {
      console.error(`No se pudo borrar el casillero ${idCasillero}:`, error);
      return null;
    }
    return resultado;
  }

  // ➤ Listar casilleros
  async Listar(idCasillero) {
    let casilleros;
    try {
      if (idCasillero === undefined) {
        casilleros = await prisma.casilleros.findMany({
          include: { clientes: true },
        });
      } else {
        casilleros = await prisma.casilleros.findMany({
          where: { CasilleroId: parseInt(idCasillero) },
          include: { clientes: true },
        });
      }
    } catch (error) {
      console.error(`Error al listar casilleros: ${error}`);
      return [];
    }
    return casilleros;
  }
}

module.exports = Casilleros;
