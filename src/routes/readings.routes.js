const { Router } = require("express");

// Middlewares
const schemaValidator = require("../apps/middlewares/schemaValidator");
const typeVerifyMiddleware = require("../apps/middlewares/typeVerify");
const sensorAuthMiddleware = require("../apps/middlewares/sensorAuth");

// Controllers
const LeituraController = require("../apps/controllers/LeituraControllers");

// Schemas
const createReadingSchema = require("../schema/create.reading.schema.json");

const router = Router();

router.post("/sensor-service/readings", sensorAuthMiddleware, schemaValidator(createReadingSchema), LeituraController.create);
router.get("/sensor/readings", LeituraController.index);
router.get("/sensor/readings/:id", LeituraController.show);
router.delete("/admin/sensor/readings/:id", typeVerifyMiddleware("admin"), LeituraController.delete);

module.exports = router;