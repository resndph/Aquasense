const { Router } = require("express");
const schemaValidator = require("./apps/middlewares/schemaValidator");

const AuthenticationMiddleware = require("./apps/middlewares/authentication");

const AuthenticationController = require("./apps/controllers/AuthenticationController");
const authSchema = require("./schema/auth.schema.json");
const userSchema = require("./schema/create.user.schema.json");
const UserControllers = require("./apps/controllers/UserControllers");

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

module.exports = routes;
