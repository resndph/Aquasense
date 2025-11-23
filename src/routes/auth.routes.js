const { Router } = require("express");
// Middlewares
const schemaValidator = require("../apps/middlewares/schemaValidator");

// Controllers
const AuthenticationController = require("../apps/controllers/AuthenticationController");

// Schemas
const authSchema = require("../schema/auth.schema.json");

const router = Router();

router.post("/auth", schemaValidator(authSchema), AuthenticationController.authenticate);

module.exports = router;