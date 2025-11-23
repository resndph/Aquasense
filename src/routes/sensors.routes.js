const { Router } = require("express");

// Midedlewares
const schemaValidator = require("../apps/middlewares/schemaValidator");
const typeVerifyMiddleware = require("../apps/middlewares/typeVerify");

// Controllers
const SensorController = require("../apps/controllers/SensorControllers");

//schemas
const createSensorSchema = require("../schema/create.sensor.schema.json");
const updateSensorSchema = require("../schema/update.sensor.schema.json");

const router = Router();

router.post("/admin/sensors", typeVerifyMiddleware("admin"), schemaValidator(createSensorSchema), SensorController.create);
router.get("/sensors", SensorController.index);
router.get("/sensors/:id", SensorController.show);
router.put("/admin/sensors/:id", typeVerifyMiddleware("admin"), schemaValidator(updateSensorSchema), SensorController.update);
router.delete("/admin/sensors/:id", typeVerifyMiddleware("admin"), SensorController.delete);

module.exports = router;