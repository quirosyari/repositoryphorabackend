const express = require("express");
const Router = express.Router();

const ServicioFacturas = require("../services/facturas.js");
const Facturas = new ServicioFacturas();

// ➤ Listar todas las facturas
Router.get("/", async (req, res) => {
  const resultados = await Facturas.Listar();
  res.json(resultados);
});
Router.get("/:idFactura", async (req, res) => {
  const resultados = await Facturas.Listar(req.params.idFactura);
  res.json(resultados);
});

Router.get("/usuario/:usuarioId", async (req, res) => {
  const usuarioId = req.params.usuarioId;
  try {
    const resultados = await Facturas.ListarPorUsuario(usuarioId);
    res.json(resultados);
  } catch (error) {
    console.error(`Error al obtener facturas del usuario ${usuarioId}:`, error);
    res.status(500).json({ error: "Error al obtener facturas del usuario." });
  }
});

// ➤ Crear factura
Router.post("/", async (req, res) => {
  if (!req.body || !req.body.UsuarioId || !req.body.TrackingId) {
    return res.status(400).json({ error: "Datos incompletos para crear factura" });
  }
  const resultado = await Facturas.Agregar(req.body);
  res.status(201).json(resultado);
});

// ➤ Actualizar factura
Router.put("/:idFactura", async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: "No hay datos para actualizar" });
  }
  const resultado = await Facturas.Actualizar(req.params.idFactura, req.body);
  res.json(resultado);
});

// ➤ Borrar factura
Router.delete("/:idFactura", async (req, res) => {
  const resultado = await Facturas.Borrar(req.params.idFactura);
  res.json(resultado);
});

module.exports = Router;
