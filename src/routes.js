const { Router } = require("express");
const UsuarioModel = require("./apps/models/Usuario");
const routes = new Router();

routes.get("/users", async (req, res) => {
  const allusers = await UsuarioModel.findAll();
  res.send({ usuarios: allusers });
});

routes.get("/health", (req, res) => {
  res.send("Server is healthy");
});

module.exports = routes;
