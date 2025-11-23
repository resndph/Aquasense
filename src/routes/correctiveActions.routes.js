const { Router } = require("express");

//Middlewares
const schemaValidator = require("../apps/middlewares/schemaValidator");
const typeVerifyMiddleware = require("../apps/middlewares/typeVerify");

//Controllers
const AcaoCorretivaController = require("../apps/controllers/AcaoCorretivaControllers");

//Schemas
const acaoUpdateSchema = require("../schema/update.acao.schema.json");
const addWorkerAcaoSchema = require("../schema/add.worker.acao.schema.json");

const router = Router();

router.get("/corrective-actions", AcaoCorretivaController.index);
router.get("/corrective-actions/:id", AcaoCorretivaController.show);
router.put("/corrective-actions/:id", typeVerifyMiddleware("pesquisador", "admin"), schemaValidator(acaoUpdateSchema), AcaoCorretivaController.update);
router.delete("/corrective-actions/:id", typeVerifyMiddleware("pesquisador", "admin"), AcaoCorretivaController.delete);
router.post("/corrective-actions/:id/workers", typeVerifyMiddleware("pesquisador", "admin"), schemaValidator(addWorkerAcaoSchema), AcaoCorretivaController.addWorker);
router.delete("/corrective-actions/:id/workers/:id_tecnico", typeVerifyMiddleware("pesquisador", "admin"), AcaoCorretivaController.removeWorker);

module.exports = router;