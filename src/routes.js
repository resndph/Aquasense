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

routes.use(AuthenticationMiddleware);

routes.put("/users", schemaValidator(updateSchema), UserControllers.update);

routes.put("/admin/users/:id", isAdmin, UserControllers.update);

module.exports = routes;
