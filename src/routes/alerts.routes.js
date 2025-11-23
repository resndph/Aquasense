const { Router } = require("express");
// Middlewares
const schemaValidator = require("../apps/middlewares/schemaValidator");
const typeVerifyMiddleware = require("../apps/middlewares/typeVerify");

// Controllers
const AlertaController = require("../apps/controllers/AlertaControllers");

// Schemas
const updateAlertSchema = require("../schema/update.alerta.schema.json");

const router = Router();

router.get("/alerts", AlertaController.index);
router.get("/alerts/:id", AlertaController.show);
router.put("/admin/alerts/:id", typeVerifyMiddleware("admin"), schemaValidator(updateAlertSchema), AlertaController.update);
router.delete("/admin/alerts/:id", typeVerifyMiddleware("admin"), AlertaController.delete);

module.exports = router;