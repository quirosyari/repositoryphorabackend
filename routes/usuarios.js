const express = require("express");
const Router = express.Router();
const ServicioUsuarios = require("./../services/usuarios.js");
const Usuarios = new ServicioUsuarios();
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { enviarCorreoBienvenida, enviarCodigoRecuperacion, enviarConfirmacionCambioClave } = require('../services/correo.js'); // Asegúrate de que exista esta función

// ➤ Contador directo (prueba)
Router.get('/contar-directo', async (req, res) => {
  try {
    const total = await prisma.usuarios.count();
    res.json({ total });
  } catch (error) {
    console.error('Error al contar directamente:', error);
    res.status(500).json({ error: 'Fallo directo' });
  }
});

// ➤ Contador normal (usando clase)
Router.get("/contar", async (req, res) => {
  try {
    const total = await Usuarios.ContarUsuarios();
    res.json({ total });
  } catch (error) {
    console.error('Error al contar usuarios:', error);
    res.status(500).json({ error: 'Error al contar usuarios' });
  }
});

// ➤ Autenticar usuario
Router.post("/autenticar", async (req, res) => {
  const { Email, Clave } = req.body;

  if (!Email || !Clave) {
    return res.status(400).json({ error: "Email y contraseña requeridos" });
  }

  try {
    const usuarioAutenticado = await Usuarios.Autenticar(Email, Clave);

    if (!usuarioAutenticado) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    res.json({
      message: "Autenticación correcta",
      usuario: usuarioAutenticado
    });
  } catch (error) {
    console.error("Error al autenticar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ➤ Crear usuario
Router.post("/", async (req, res) => {
  const { Email, Nombre, PasswordHash } = req.body;

  if (!Email || !Nombre || !PasswordHash) {
    return res.status(400).json({ error: "Los datos obligatorios son inválidos" });
  }

  const hash = await bcrypt.hash(PasswordHash, 10);

  const nuevoUsuario = {
    ...req.body,
    PasswordHash: hash,
    Rol: req.body.Rol || "cliente"
  };

  const resultado = await Usuarios.Agregar(nuevoUsuario);

  if (!resultado) {
    return res.status(500).json({ error: "No se pudo crear el usuario" });
  }

  try {
    await enviarCorreoBienvenida(resultado.Email, resultado.Nombre);
  } catch (error) {
    console.error("❌ Error al enviar correo de bienvenida:", error);
  }

  res.status(201).json(resultado);
});


Router.post("/solicitar-codigo", async (req, res) => {
  console.log("➡️  POST /usuarios/solicitar-codigo", {
    contentType: req.headers["content-type"],
    body: req.body,
  });

  const email = (req.body?.email || "").toString().trim().toLowerCase();
  if (!email) return res.status(400).json({ error: "Correo requerido" });

  let usuario;
  let codigo;
  try {
    usuario = await prisma.usuarios.findUnique({ where: { Email: email } });
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiracion = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.usuarios.update({
      where: { UsuarioId: usuario.UsuarioId },
      data: { CodigoRecuperacion: codigo, ExpiraCodigo: expiracion },
    });

    console.log("💾 Código guardado en DB:", {
      usuarioId: usuario.UsuarioId,
      email: usuario.Email,
      expira: expiracion.toISOString(),
    });
  } catch (e) {
    console.error("❌ DB error (solicitar-codigo):", { message: e?.message, stack: e?.stack });
    return res.status(500).json({ error: "Error guardando el código" });
  }

  try {
    console.log("📧 Enviando código:", { para: email, nombre: usuario.Nombre, codigo });
    await enviarCodigoRecuperacion(email, usuario.Nombre, codigo);
    return res.status(200).json({ mensaje: "Código enviado al correo" });
  } catch (e) {
  const detalle = {
    message: e?.message,
    code: e?.code,
    command: e?.command,
    response: e?.response,
  };
  console.error("❌ SMTP error (solicitar-codigo):", detalle);
  return res.status(500).json({ error: "Fallo al enviar correo", ...detalle });
}
});
Router.post("/verificar-codigo", async (req, res) => {
  const { email, codigo } = req.body;

  if (!email || !codigo) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const valido = await Usuarios.VerificarCodigoRecuperacion(email, codigo);
  console.log("Valor de 'valido':", valido, "Tipo:", typeof valido);

  // Comparación estricta para evitar falsos negativos
  if (valido !== true) {
    return res.status(401).json({ error: "Código incorrecto" });
  }

  return res.status(200).json({ mensaje: "Código verificado correctamente" });
});
Router.post("/recuperar-contrasena", async (req, res) => {
  const { email, nuevaClave } = req.body;

  if (!email || !nuevaClave) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const usuario = await Usuarios.BuscarPorEmail(email);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const nuevoHash = await bcrypt.hash(nuevaClave, 10);
    const resultado = await Usuarios.ActualizarContrasena(usuario.UsuarioId, nuevoHash);

    if (!resultado) {
      return res.status(500).json({ error: "No se pudo actualizar la contraseña." });
    }

    // ✅ Enviar confirmación por correo
    await enviarConfirmacionCambioClave(usuario.Email, usuario.Nombre);

    return res.status(200).json({ mensaje: "Contraseña actualizada correctamente." });
  } catch (error) {
    console.error("Error en recuperar-contrasena:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});


// ➤ Listar todos
Router.get("/", async (req, res) => {
  try {
    const usuarios = await Usuarios.Listar();

    const usuariosSeguros = usuarios.map(usuario => {
      const {
        PasswordHash,
        CodigoRecuperacion,
        ExpiraCodigo,
        ...datosSeguros
      } = usuario;

      return datosSeguros;
    });

    res.json(usuariosSeguros);

  } catch (error) {
    console.error("Error al listar usuarios:", error);
    res.status(500).json({
      error: "Error al listar usuarios"
    });
  }
});
// ➤ Listar uno por ID
Router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }
  const usuario = await Usuarios.Listar(id);
  res.json(usuario);
});

// ➤ Actualizar
Router.put("/:id", async (req, res) => {
  const idUsuario = req.params.id;
  const datosUsuario = { ...req.body };

  try {
    if (datosUsuario.PasswordHash) {
      datosUsuario.PasswordHash = await bcrypt.hash(datosUsuario.PasswordHash, 10);
    }

    const resultado = await Usuarios.Actualizar(idUsuario, datosUsuario);

    if (!resultado) {
      return res.status(404).json({ error: "No se pudo actualizar el usuario" });
    }

    res.json(resultado);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

// ➤ Eliminar
Router.delete("/:id", async (req, res) => {
  const resultado = await Usuarios.Borrar(req.params.id);
  res.json(resultado);
});

module.exports = Router;
