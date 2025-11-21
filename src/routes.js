const { Router } = require("express");

// Middlewares
const schemaValidator = require("./apps/middlewares/schemaValidator");
const AuthenticationMiddleware = require("./apps/middlewares/authentication");
const OptionalAuthMiddleware = require("./apps/middlewares/optionalAuth");
const typeVerifyMiddleware = require("./apps/middlewares/typeVerify");

// Controllers
const AuthenticationController = require("./apps/controllers/AuthenticationController");
const UserControllers = require("./apps/controllers/UserControllers");
const StationController = require("./apps/controllers/StationControllers");
const RelatorioController = require("./apps/controllers/RelatorioControllers");
const AcaoCorretivaController = require("./apps/controllers/AcaoCorretivaControllers");
const SensorController = require("./apps/controllers/SensorControllers");
const LeituraController = require("./apps/controllers/LeituraControllers");

// Schemas
const authSchema = require("./schema/auth.schema.json");
const updateSchema = require("./schema/update.user.schema.json");
const userSchema = require("./schema/create.user.schema.json");
const stationSchema = require("./schema/create.station.schema.json");
const stationUpdateSchema = require("./schema/update.station.schema.json");
const addworkerSchema = require("./schema/add.worker.schema.json");
const createSensorSchema = require("./schema/create.sensor.schema.json");
const updateSensorSchema = require("./schema/update.sensor.schema.json");
const createReadingSchema = require("./schema/create.reading.schema.json");
const relatorioSchema = require("./schema/create.report.schema.json");
const relatorioUpdateSchema = require("./schema/update.report.schema.json");
const acaoUpdateSchema = require("./schema/update.acao.schema.json");
const addWorkerAcaoSchema = require("./schema/add.worker.acao.schema.json");


const routes = new Router();

routes.post("/users", OptionalAuthMiddleware, schemaValidator(userSchema), UserControllers.create);  
routes.post("/auth", schemaValidator(authSchema), AuthenticationController.authenticate);  
routes.get("/health", (req, res) => {res.send("Server is healthy");}); 

routes.use(AuthenticationMiddleware); 

// Rotas de Usuários

routes.get("/users/me", UserControllers.show); 
routes.put("/users/me", schemaValidator(updateSchema), UserControllers.update); 
routes.get("/admin/users", typeVerifyMiddleware("admin"), UserControllers.index); 
routes.get("/admin/users/:id", typeVerifyMiddleware("admin"), UserControllers.show); 
routes.put("/admin/users/:id", schemaValidator(updateSchema), typeVerifyMiddleware("admin"), UserControllers.update); 
routes.delete("/admin/users/:id", typeVerifyMiddleware("admin"), UserControllers.delete);

// Rotas de Estações

routes.post("/admin/stations", typeVerifyMiddleware("admin"),schemaValidator(stationSchema),StationController.create); 
routes.get("/stations", StationController.index); 
routes.get("/stations/:id", StationController.show); 
routes.put("/admin/stations/:id", typeVerifyMiddleware("admin"),schemaValidator(stationUpdateSchema), StationController.update); 
routes.delete("/admin/stations/:id", typeVerifyMiddleware("admin"), StationController.delete); 
routes.post("/admin/stations/:id/workers", typeVerifyMiddleware("admin"),schemaValidator(addworkerSchema), StationController.addWorker); 
routes.delete("/admin/stations/:id/workers/:id_tecnico", typeVerifyMiddleware("admin"), StationController.removeWorker); 

// Rotas de Relatórios

routes.post("/reports", typeVerifyMiddleware("pesquisador", "admin"), schemaValidator(relatorioSchema), RelatorioController.create); 
routes.get("/reports", RelatorioController.index); 
routes.get("/reports/:id", RelatorioController.show); 
routes.put("/reports/:id", typeVerifyMiddleware("pesquisador", "admin"), schemaValidator(relatorioUpdateSchema), RelatorioController.update); 
routes.delete("/reports/:id", typeVerifyMiddleware("pesquisador", "admin"), RelatorioController.delete); 

// Rotas de Ações Corretivas

routes.get("/corrective-actions", AcaoCorretivaController.index); 
routes.get("/corrective-actions/:id", AcaoCorretivaController.show); 
routes.put("/corrective-actions/:id", typeVerifyMiddleware("pesquisador", "admin"), schemaValidator(acaoUpdateSchema), AcaoCorretivaController.update); 
routes.delete("/corrective-actions/:id", typeVerifyMiddleware("pesquisador", "admin"), AcaoCorretivaController.delete); 
routes.post("/corrective-actions/:id/workers", typeVerifyMiddleware("pesquisador", "admin"), schemaValidator(addWorkerAcaoSchema), AcaoCorretivaController.addWorker); 
routes.delete("/corrective-actions/:id/workers/:id_tecnico", typeVerifyMiddleware("pesquisador", "admin"), AcaoCorretivaController.removeWorker); 

// Rotas de Sensores

routes.post("/sensors", typeVerifyMiddleware("admin"), schemaValidator(createSensorSchema), SensorController.create); 
routes.get("/sensors", SensorController.index); 
routes.get("/sensors/:id", SensorController.show); 
routes.put("/sensors/:id", typeVerifyMiddleware("admin"), schemaValidator(updateSensorSchema), SensorController.update); 
routes.delete("/sensors/:id", typeVerifyMiddleware("admin"), SensorController.delete); 

// Rotas de Leituras

routes.post("/admin/sensor/readings", typeVerifyMiddleware("admin"), schemaValidator(createReadingSchema), LeituraController.create); 
routes.get("/sensor/readings", LeituraController.index); 
routes.get("/sensor/readings/:id", LeituraController.show); 
routes.delete("/admin/sensor/readings/:id", typeVerifyMiddleware("admin"), LeituraController.delete); 



module.exports = routes;
