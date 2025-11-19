const { Router } = require("express");
const schemaValidator = require("./apps/middlewares/schemaValidator");

const AuthenticationMiddleware = require("./apps/middlewares/authentication");

const AuthenticationController = require("./apps/controllers/AuthenticationController");
const UserControllers = require("./apps/controllers/UserControllers");

const authSchema = require("./schema/auth.schema.json");
const updateSchema = require("./schema/update.user.schema.json");
const userSchema = require("./schema/create.user.schema.json");
const isAdmin = require("./apps/middlewares/isAdmin");

const routes = new Router();

routes.post("/users", schemaValidator(userSchema), UserControllers.create);

routes.post(
  "/auth",
  schemaValidator(authSchema),
  AuthenticationController.authenticate
);

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



module.exports = routes;
