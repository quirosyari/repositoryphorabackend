const express = require("express");
const Router = express.Router();
const EstadisticasService = require("../services/estadisticas.js");
const Estadisticas = new EstadisticasService();

// ➤ Trackings agrupados por estado
Router.get("/trackings-por-estado", async (req, res) => {
  try {
    const resultado = await Estadisticas.trackingsPorEstado();
    res.json(resultado);
  } catch (error) {
    console.error("Error en ruta /estadisticas/trackings-por-estado:", error);
    res.status(500).json({ error: "No se pudieron obtener los datos" });
  }
});


module.exports = Router;
