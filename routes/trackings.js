const express = require("express");
const Router = express.Router();
const ServicioTrackings = require("./../services/trackings.js");
const Trackings = new ServicioTrackings();
const Historial = require("./../services/historialcambios.js");


Router.get("/", async (req, res) => {
  const resultados = await Trackings.Listar();
  res.json(resultados);
});
Router.get("/:idTracking/historial", async (req, res) => {
  try {
    const historial = await Historial.ListarPorTracking(req.params.idTracking);
    res.json(historial);
  } catch (error) {
    console.error("Error al obtener historial del tracking:", error);
    res.status(500).json({ error: "Error al obtener historial de cambios" });
  }
});
// ➤ Listar por ID de tracking
Router.get("/:idTracking", async (req, res) => {
  const resultados = await Trackings.Listar(req.params.idTracking);
  res.json(resultados);
});
// ➤ NUEVO: Listar todos los trackings de un cliente
Router.get("/cliente/:clienteId", async (req, res) => {
  const clienteId = req.params.clienteId;
  try {
    const resultados = await Trackings.ListarPorCliente(clienteId);
    res.json(resultados);
  } catch (error) {
    console.error(`Error al obtener trackings del cliente ${clienteId}:`, error);
    res.status(500).json({ error: "Error al obtener trackings del cliente." });
  }
});



// ➤ Crear
Router.post("/", async (req, res) => {
  if (!req.body || !req.body.NumeroTracking) {
    return res.status(400).json({ error: "Los datos del tracking son inválidos" });
  }
  const resultado = await Trackings.Agregar(req.body);
  res.status(201).json(resultado);
});
Router.put("/:idTracking", async (req, res) => {
  const idTracking = req.params.idTracking;
  const nuevosDatos = req.body;

  if (!nuevosDatos || !nuevosDatos.Status) {
    return res.status(400).json({ error: "Debe enviar el nuevo estado" });
  }

  try {
    const trackingAntes = await Trackings.Listar(idTracking);
    if (!trackingAntes) {
      return res.status(404).json({ error: "Tracking no encontrado" });
    }

    // ⚠️ Aquí pasamos el usuarioId desde el body (o puedes usar session si tienes auth)
    const resultadoUpdate = await Trackings.Actualizar(idTracking, nuevosDatos, nuevosDatos.UsuarioId);

    res.json(resultadoUpdate);

  } catch (error) {
    console.error("Error actualizando tracking:", error);
    res.status(500).json({ error: "Error al actualizar tracking" });
  }
});



// ➤ Borrar
Router.delete("/:idTracking", async (req, res) => {
  const resultado = await Trackings.Borrar(req.params.idTracking);
  res.json(resultado);
});

module.exports = Router;
