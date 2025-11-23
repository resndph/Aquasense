const { Router } = require("express");

// Middlewares
const schemaValidator = require("../apps/middlewares/schemaValidator");
const typeVerifyMiddleware = require("../apps/middlewares/typeVerify");

// Controller 
const RelatorioController = require("../apps/controllers/RelatorioControllers");

// Schemas
const relatorioSchema = require("../schema/create.report.schema.json");
const relatorioUpdateSchema = require("../schema/update.report.schema.json");

const router = Router();

router.post("/reports", typeVerifyMiddleware("pesquisador"), schemaValidator(relatorioSchema), RelatorioController.create);
router.get("/reports", RelatorioController.index);
router.get("/reports/:id", RelatorioController.show);
router.put("/reports/:id", typeVerifyMiddleware("pesquisador", "admin"), schemaValidator(relatorioUpdateSchema), RelatorioController.update);
router.delete("/reports/:id", typeVerifyMiddleware("pesquisador", "admin"), RelatorioController.delete);

module.exports = router;