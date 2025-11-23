const { Router } = require("express");

// Middlewares
const OptionalAuthMiddleware = require("../apps/middlewares/optionalAuth");
const typeVerifyMiddleware = require("../apps/middlewares/typeVerify");
const AuthenticationMiddleware = require("../apps/middlewares/authentication");
const schemaValidator = require("../apps/middlewares/schemaValidator");

// Controllers
const UserControllers = require("../apps/controllers/UserControllers");

// Schemas
const updateSchema = require("../schema/update.user.schema.json");
const userSchema = require("../schema/create.user.schema.json");

const router = Router();

// Rotas públicas
router.post("/users",OptionalAuthMiddleware,schemaValidator(userSchema),UserControllers.create);

// Rotas autenticadas
router.use(AuthenticationMiddleware);

router.get("/users/me", UserControllers.show);
router.put("/users/me", schemaValidator(updateSchema), UserControllers.update);

// Admin
router.get("/admin/users", typeVerifyMiddleware("admin"), UserControllers.index);
router.get("/admin/users/:id", typeVerifyMiddleware("admin"), UserControllers.show);
router.put("/admin/users/:id",typeVerifyMiddleware("admin"),schemaValidator(updateSchema),UserControllers.update);
router.delete("/admin/users/:id",typeVerifyMiddleware("admin"),UserControllers.delete);

module.exports = router;
