const { Router } = require("express");
// Middlewares
const schemaValidator = require("../apps/middlewares/schemaValidator");
const typeVerifyMiddleware = require("../apps/middlewares/typeVerify");

// Controllers
const CalibragemController = require("../apps/controllers/CalibragemControllers");

// Schemas
const creatCalibragemSchema = require("../schema/create.calibragem.schema.json");

const router = Router();

router.post("/calibrations", typeVerifyMiddleware("tecnico"), schemaValidator(creatCalibragemSchema), CalibragemController.create);
router.get("/calibrations", typeVerifyMiddleware("admin", "tecnico"), CalibragemController.index);
router.get("/calibrations/:id_tecnico/:id_sensor", typeVerifyMiddleware("admin", "tecnico"), CalibragemController.show);
router.delete("/calibrations/:id_tecnico/:id_sensor", typeVerifyMiddleware("admin", "tecnico"), CalibragemController.delete);

module.exports = router;