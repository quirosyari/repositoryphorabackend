const express = require("express");
const Router = express.Router();

const Historial = require("./../services/historialcambios.js"); // no usar 'new', ya lo exportas instanciado

// ➤ Listar todos los cambios
Router.get("/", async (req, res) => {
  try {
    const resultado = await Historial.Listar();
    res.json(resultado);
  } catch (error) {
    console.error("❌ Error al obtener historial:", error);
    res.status(500).json({ error: "Error al listar historial" });
  }
});

// ➤ Listar un historial por ID
Router.get("/:idHistorial", async (req, res) => {
  try {
    const resultado = await Historial.Listar(req.params.idHistorial);
    res.json(resultado);
  } catch (error) {
    console.error("❌ Error al obtener historial por ID:", error);
    res.status(500).json({ error: "Error al listar por ID" });
  }
});

// ➤ Listar historial por tracking específico
Router.get("/tracking/:trackingId", async (req, res) => {
  try {
    const resultado = await Historial.ListarPorTracking(req.params.trackingId);
    res.json(resultado);
  } catch (error) {
    console.error("❌ Error al obtener historial del tracking:", error);
    res.status(500).json({ error: "Error al listar historial por tracking" });
  }
});

// ➤ Agregar nuevo cambio al historial
Router.post("/", async (req, res) => {
  try {
    if (!req.body || !req.body.TrackingId || !req.body.Campo) {
      return res.status(400).json({ error: "Datos incompletos para registrar cambio" });
    }

    const resultado = await Historial.Agregar(req.body);
    res.status(201).json(resultado);
  } catch (error) {
    console.error("❌ Error al agregar cambio al historial:", error);
    res.status(500).json({ error: "Error al agregar cambio" });
  }
});

module.exports = Router;
