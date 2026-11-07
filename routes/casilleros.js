const express = require("express");
const Router = express.Router();

const ServicioCasilleros = require("./../services/casilleros.js");
const Casilleros = new ServicioCasilleros();

// Listar
Router.get("/", async (req, res) => {
  const resultados = await Casilleros.Listar();
  res.json(resultados);
});

Router.get("/:idCasillero", async (req, res) => {
  const resultados = await Casilleros.Listar(req.params.idCasillero);
  res.json(resultados);
});

// Crear
Router.post("/", async (req, res) => {
  if (!req.body || !req.body.CodigoCasillero || !req.body.ClienteId) {
    return res.status(400).json({ error: "Los datos del casillero son inválidos" });
  }
  const resultado = await Casilleros.Agregar(req.body);
  res.status(201).json(resultado);
});

// Actualizar
Router.put("/:idCasillero", async (req, res) => {
  if (!req.body || !req.body.CodigoCasillero) {
    return res.status(400).json({ error: "Debe enviar el nuevo código de casillero" });
  }
  const resultado = await Casilleros.Actualizar(req.params.idCasillero, req.body);
  res.json(resultado);
});

// Borrar
Router.delete("/:idCasillero", async (req, res) => {
  const resultado = await Casilleros.Borrar(req.params.idCasillero);
  res.json(resultado);
});

module.exports = Router;
