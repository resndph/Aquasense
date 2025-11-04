const { Router } = require("express");
const UsuarioModel = require("./apps/models/Usuario");
const UserControllers = require("./apps/controllers/UserControllers");
const schemaValidator = require("./apps/middlewares/schemaValidator");
const userSchema = require("./schema/create.user.schema.json");
const routes = new Router();

routes.get("/users", async (req, res) => {
  const allusers = await UsuarioModel.findAll();
  res.send({ usuarios: allusers });
});

routes.post("/users", schemaValidator(userSchema), UserControllers.create);

routes.get("/health", (req, res) => {
  res.send("Server is healthy");
});

module.exports = routes;
