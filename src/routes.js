const { Router } = require("express");
const schemaValidator = require("./apps/middlewares/schemaValidator");

const AuthenticationMiddleware = require("./apps/middlewares/authentication");
const OptionalAuthMiddleware = require("./apps/middlewares/optionalAuth");
const isAdmin = require("./apps/middlewares/isAdmin");


const AuthenticationController = require("./apps/controllers/AuthenticationController");
const UserControllers = require("./apps/controllers/UserControllers");
const stationController = require("./apps/controllers/StationControllers");

const authSchema = require("./schema/auth.schema.json");
const updateSchema = require("./schema/update.user.schema.json");
const userSchema = require("./schema/create.user.schema.json");
const stationSchema = require("./schema/create.station.schema.json");
const stationUpdateSchema = require("./schema/update.station.schema.json");
const addworkerSchema = require("./schema/add.worker.schema.json");

const routes = new Router();

routes.post("/users", OptionalAuthMiddleware, schemaValidator(userSchema), UserControllers.create);

routes.post("/auth", schemaValidator(authSchema), AuthenticationController.authenticate);

routes.get("/health", (req, res) => {
  res.send("Server is healthy");
});

routes.use(AuthenticationMiddleware); // Todas rotas abaixo exigem autenticação

// Rotas de Usuários

routes.get("/users/me", UserControllers.show); //Pega os dados do usuário logado

routes.put("/users/me", schemaValidator(updateSchema), UserControllers.update); //Atualiza os dados do usuário logado

routes.get("/admin/users", isAdmin, UserControllers.index); //Lista todos os usuários (admin only)

routes.get("/admin/users/:id", isAdmin, UserControllers.show); //Pega os dados de um usuário específico (admin only)

routes.put("/admin/users/:id", schemaValidator(updateSchema), isAdmin, UserControllers.update); //Atualiza os dados de um usuário específico (admin only)

routes.delete("/admin/users/:id", isAdmin, UserControllers.delete); //Deleta um usuário específico (admin only)

// Rotas de Estações

routes.post("/admin/stations", isAdmin,schemaValidator(stationSchema),stationController.create); //Cria uma nova estação (admin only)

routes.get("/stations", stationController.index); //Lista todas as estações

routes.get("/stations/:id", stationController.show); //Pega os dados de uma estação específica

routes.put("/admin/stations/:id", isAdmin,schemaValidator(stationUpdateSchema), stationController.update); //Atualiza os dados de uma estação específica (admin only)

routes.delete("/admin/stations/:id", isAdmin, stationController.delete); //Deleta uma estação específica (admin only)

routes.post("/admin/stations/:id/workers", isAdmin,schemaValidator(addworkerSchema), stationController.addWorker); //Adiciona um trabalhador a uma estação (admin only)

routes.delete("/admin/stations/:id/workers/:id_tecnico", isAdmin, stationController.removeWorker); //Remove um trabalhador de uma estação (admin only)

module.exports = routes;
