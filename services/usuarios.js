const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

class Usuarios {
  constructor() {}

  // ➤ Agregar usuario
  async Agregar(usuario) {
    try {
      return await prisma.usuarios.create({
        data: {
          Nombre: usuario.Nombre,
          Apellido: usuario.Apellido,
          SegundoApellido: usuario.SegundoApellido,
          NumeroIdentificacion: usuario.NumeroIdentificacion,
          Email: usuario.Email,
          Telefono: usuario.Telefono,
          Provincia: usuario.Provincia,
          Canton: usuario.Canton,
          Distrito: usuario.Distrito,
          Direccion: usuario.Direccion,
          PasswordHash: usuario.PasswordHash,
          Rol: usuario.Rol || "cliente",
          FechaRegistro: new Date()
        },
      });
    } catch (error) {
      console.error("❌ No se pudo insertar el usuario:", error);
      return null;
    }
  }

  // ➤ Actualizar usuario
  async Actualizar(idUsuario, datosUsuario) {
    if (!idUsuario || isNaN(idUsuario)) {
      console.error("ID de usuario inválido:", idUsuario);
      return null;
    }

    try {
      const dataToUpdate = {};

      [
        "Nombre", "Apellido", "SegundoApellido", "NumeroIdentificacion",
        "Email", "Telefono", "Provincia", "Canton", "Distrito",
        "Direccion", "Rol"
      ].forEach((campo) => {
        if (datosUsuario[campo] !== undefined) {
          dataToUpdate[campo] = datosUsuario[campo];
        }
      });

      if (
        datosUsuario.PasswordHash &&
        typeof datosUsuario.PasswordHash === "string" &&
        datosUsuario.PasswordHash.trim() !== ""
      ) {
        dataToUpdate.PasswordHash = datosUsuario.PasswordHash;
      }

      return await prisma.usuarios.update({
        where: { UsuarioId: parseInt(idUsuario) },
        data: dataToUpdate,
      });

    } catch (error) {
      console.error(`❌ Error al actualizar usuario ${idUsuario}:`, error);
      return null;
    }
  }

  // ➤ Eliminar usuario
  async Borrar(idUsuario) {
    try {
      return await prisma.usuarios.delete({
        where: { UsuarioId: parseInt(idUsuario) },
      });
    } catch (error) {
      console.error(`❌ Error al borrar usuario ${idUsuario}:`, error);
      return null;
    }
  }

  // ➤ Contar usuarios
  async ContarUsuarios() {
    try {
      return await prisma.usuarios.count();
    } catch (error) {
      console.error("❌ Error al contar usuarios:", error);
      return 0;
    }
  }

  // ➤ Listar usuarios
  async Listar(idUsuario) {
    try {
      if (!idUsuario || isNaN(parseInt(idUsuario))) {
        return await prisma.usuarios.findMany();
      }

      return await prisma.usuarios.findMany({
        where: { UsuarioId: parseInt(idUsuario) },
      });
    } catch (error) {
      console.error(`❌ Error al listar usuarios:`, error);
      return [];
    }
  }

  // ➤ Autenticar usuario
  async Autenticar(Email, clave) {
    if (!Email || !clave) throw new Error("Email y contraseña requeridos");

    try {
      const usuario = await prisma.usuarios.findUnique({ where: { Email } });
      if (!usuario) return null;

      const esValido = await bcrypt.compare(clave, usuario.PasswordHash);
      if (!esValido) return null;

      return {
        UsuarioId: usuario.UsuarioId,
        Nombre: usuario.Nombre,
        Email: usuario.Email,
        Rol: usuario.Rol,
      };
    } catch (error) {
      console.error("❌ Error al autenticar usuario:", error);
      return null;
    }
  }

  // ➤ Buscar usuario por correo
  async BuscarPorEmail(email) {
    try {
      return await prisma.usuarios.findUnique({ where: { Email: email } });
    } catch (error) {
      console.error("❌ Error al buscar usuario por email:", error);
      return null;
    }
  }

  // ➤ Actualizar solo la contraseña
  async ActualizarContrasena(idUsuario, nuevoHash) {
    try {
      return await prisma.usuarios.update({
        where: { UsuarioId: parseInt(idUsuario) },
        data: { PasswordHash: nuevoHash }
      });
    } catch (error) {
      console.error("❌ Error al actualizar contraseña:", error);
      return null;
    }
  }

  // ➤ Guardar código de recuperación por ID
  async GuardarCodigoRecuperacion(idUsuario, codigo) {
    try {
      return await prisma.usuarios.update({
        where: { UsuarioId: parseInt(idUsuario) },
        data: { CodigoRecuperacion: codigo }
      });
    } catch (error) {
      console.error("❌ Error al guardar el código de recuperación:", error);
      return null;
    }
  }

  // ➤ Generar código y guardarlo por correo
  async GenerarCodigoRecuperacion(email, codigo) {
    try {
      return await prisma.usuarios.update({
        where: { Email: email },
        data: { CodigoRecuperacion: codigo }
      });
    } catch (error) {
      console.error("❌ Error al generar código de recuperación:", error);
      return null;
    }
  }

// services/usuarios.js
async VerificarCodigoRecuperacion(email, codigo) {
  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { Email: email }
    });

    if (!usuario || !usuario.CodigoRecuperacion) {
      console.log("🟡 Usuario no encontrado o sin código");
      return false;
    }

    const recibido = codigo.toString().trim();
    const guardado = usuario.CodigoRecuperacion.toString().trim();

    console.log("🔍 Comparando códigos:");
    console.log("Recibido:", recibido);
    console.log("Guardado:", guardado);

    // Si querés invalidarlo después, podés hacerlo aquí también
    if (recibido === guardado) {
      await prisma.usuarios.update({
        where: { Email: email },
        data: { CodigoRecuperacion: null }
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error("❌ Error al verificar código de recuperación:", error);
    return false;
  }
}

}

module.exports = Usuarios;
