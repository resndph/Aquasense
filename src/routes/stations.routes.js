const { Router } = require("express");
// Middlewares
const schemaValidator = require("../apps/middlewares/schemaValidator");
const typeVerifyMiddleware = require("../apps/middlewares/typeVerify");

// Controllers
const StationController = require("../apps/controllers/StationControllers");

// Schemas
const stationSchema = require("../schema/create.station.schema.json");
const stationUpdateSchema = require("../schema/update.station.schema.json");
const addworkerSchema = require("../schema/add.worker.schema.json");

const router = Router();

router.get("/stations", StationController.index);
router.get("/stations/:id", StationController.show);

// Admin 
router.post("/admin/stations", typeVerifyMiddleware("admin"), schemaValidator(stationSchema), StationController.create);
router.put("/admin/stations/:id", typeVerifyMiddleware("admin"), schemaValidator(stationUpdateSchema), StationController.update);
router.delete("/admin/stations/:id", typeVerifyMiddleware("admin"), StationController.delete);
router.post("/admin/stations/:id", typeVerifyMiddleware("admin"), schemaValidator(addworkerSchema), StationController.addWorker);
router.delete("/admin/stations/:id/:id_tecnico", typeVerifyMiddleware("admin"), StationController.removeWorker);

module.exports = router;