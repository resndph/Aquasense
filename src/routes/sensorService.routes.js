const { Router } = require("express");
// Middlewares
const sensorAuthMiddleware = require("../apps/middlewares/sensorAuth");

// Controllers
const SensorController = require("../apps/controllers/SensorControllers");

const router = Router();

if (process.env.NODE_ENV !== "production") {
  router.get("/dev/generate-sensor-token", SensorController.generateSensorToken);
}
router.get("/sensor-service/sensors", sensorAuthMiddleware, SensorController.indexForSimulator);

module.exports = router;