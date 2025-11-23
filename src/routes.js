const { Router } = require("express");
const { upload } = require("./configs/multer");

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
const AlertaController = require("./apps/controllers/AlertaControllers");
const CalibragemController = require("./apps/controllers/CalibragemControllers");
const FileController = require("./apps/controllers/FileController");

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
const updateAlertSchema = require("./schema/update.alerta.schema.json");
const creatCalibragemSchema = require("./schema/create.calibragem.schema.json");


const routes = new Router();

routes.post("/users", OptionalAuthMiddleware, schemaValidator(userSchema), UserControllers.create); //Cria um novo usuário 
routes.post("/auth", schemaValidator(authSchema), AuthenticationController.authenticate);  //Autentica um usuário 
routes.get("/health", (req, res) => {res.send("Server is healthy");}); // Rota de verificação de saúde do servidor

routes.use(AuthenticationMiddleware); // Todas rotas abaixo exigem autenticação

// Rotas de Usuários

routes.get("/users/me", UserControllers.show); //Pega os dados do usuário logado
routes.put("/users/me", schemaValidator(updateSchema), UserControllers.update); //Atualiza os dados do usuário logado
routes.get("/admin/users", typeVerifyMiddleware("admin"), UserControllers.index); //Lista todos os usuários (admin only)
routes.get("/admin/users/:id", typeVerifyMiddleware("admin"), UserControllers.show); //Pega os dados de um usuário específico (admin only)
routes.put("/admin/users/:id", schemaValidator(updateSchema), typeVerifyMiddleware("admin"), UserControllers.update); //Atualiza os dados de um usuário específico (admin only)
routes.delete("/admin/users/:id", typeVerifyMiddleware("admin"), UserControllers.delete); //Deleta um usuário específico (admin only)

// Rotas de Estações

routes.post("/admin/stations", typeVerifyMiddleware("admin"),schemaValidator(stationSchema),StationController.create); //Cria uma nova estação (admin only)
routes.get("/stations", StationController.index); //Lista todas as estações disponíveis
routes.get("/stations/:id", StationController.show); //Pega os dados de uma estação específica
routes.put("/admin/stations/:id", typeVerifyMiddleware("admin"),schemaValidator(stationUpdateSchema), StationController.update); //Atualiza os dados de uma estação específica (admin only)
routes.delete("/admin/stations/:id", typeVerifyMiddleware("admin"), StationController.delete); //Deleta uma estação específica (admin only)
routes.post("/admin/stations/:id/workers", typeVerifyMiddleware("admin"),schemaValidator(addworkerSchema), StationController.addWorker); //Adiciona um trabalhador a uma estação (admin only)
routes.delete("/admin/stations/:id/workers/:id_tecnico", typeVerifyMiddleware("admin"), StationController.removeWorker); //Remove um trabalhador de uma estação (admin only)

// Rotas de Relatórios

routes.post("/reports", typeVerifyMiddleware("pesquisador"), schemaValidator(relatorioSchema), RelatorioController.create); //Cria um novo relatório e suas ações corretivas associadas (pesquisador)
routes.get("/reports", RelatorioController.index); //Lista todos os relatórios, suas ações corretivas e seus pesquisadores associados retornando somente os relatórios das estações que o técnico logado trabalha (regra de negócio no controller)
routes.get("/reports/:id", RelatorioController.show); //Busca um relatório específico com suas ações corretivas e técnicos associados retornando somente se o técnico logado trabalha na estação do alerta  (regra de negócio no controller)
routes.put("/reports/:id", typeVerifyMiddleware("pesquisador", "admin"), schemaValidator(relatorioUpdateSchema), RelatorioController.update); //Atualiza um relatório existente (pesquisador, admin)
routes.delete("/reports/:id", typeVerifyMiddleware("pesquisador", "admin"), RelatorioController.delete); //Deleta um relatório (pesquisador, admin)

// Rotas de Ações Corretivas

routes.get("/corrective-actions", AcaoCorretivaController.index); //Lista todas as ações corretivas retornando somente as ações dos técnicos logados 
routes.get("/corrective-actions/:id", AcaoCorretivaController.show); //Busca uma ação corretiva específica retornando somente se o técnico logado está associado a ela 
routes.put("/corrective-actions/:id", typeVerifyMiddleware("pesquisador", "admin"), schemaValidator(acaoUpdateSchema), AcaoCorretivaController.update); //Atualiza uma ação corretiva (pesquisador, admin)
routes.delete("/corrective-actions/:id", typeVerifyMiddleware("pesquisador", "admin"), AcaoCorretivaController.delete); //Deleta uma ação corretiva (pesquisador, admin)
routes.post("/corrective-actions/:id/workers", typeVerifyMiddleware("pesquisador", "admin"), schemaValidator(addWorkerAcaoSchema), AcaoCorretivaController.addWorker); //Adiciona um técnico a uma ação corretiva (pesquisador, admin)
routes.delete("/corrective-actions/:id/workers/:id_tecnico", typeVerifyMiddleware("pesquisador", "admin"), AcaoCorretivaController.removeWorker); //Remove um técnico de uma ação corretiva (pesquisador, admin)

// Rotas de Sensores

routes.post("/sensors", typeVerifyMiddleware("admin"), schemaValidator(createSensorSchema), SensorController.create); //Cria um novo sensor (admin only)
routes.get("/sensors", SensorController.index); //Lista todos os sensores disponíveis
routes.get("/sensors/:id", SensorController.show); //Pega os dados de um sensor específico
routes.put("/sensors/:id", typeVerifyMiddleware("admin"), schemaValidator(updateSensorSchema), SensorController.update); //Atualiza os dados de um sensor específico (admin only)
routes.delete("/sensors/:id", typeVerifyMiddleware("admin"), SensorController.delete); //Deleta um sensor específico (admin only)

// Rotas de Leituras

routes.post("/admin/sensor/readings", typeVerifyMiddleware("admin"), schemaValidator(createReadingSchema), LeituraController.create); //Cria uma nova leitura de sensor (admin only)
routes.get("/sensor/readings", LeituraController.index); //Lista todas as leituras disponíveis
routes.get("/sensor/readings/:id", LeituraController.show); //Pega os dados de uma leitura específica
routes.delete("/admin/sensor/readings/:id", typeVerifyMiddleware("admin"), LeituraController.delete); //Deleta uma leitura específica (admin only)

// Rotas de Alertas

routes.get("/alerts", AlertaController.index); //Lista todos os alertas disponíveis retornando somente os alertas das estações que o técnico logado trabalha (regra de negócio no controller)
routes.get("/alerts/:id", AlertaController.show); //Pega os dados de um alerta específico retornando somente se o técnico logado trabalha na estação do alerta (regra de negócio no controller)
routes.put("/alerts/:id", typeVerifyMiddleware("admin"), schemaValidator(updateAlertSchema), AlertaController.update); //Atualiza os dados de um alerta específico (admin only)
routes.delete("/admin/alerts/:id", typeVerifyMiddleware("admin"), AlertaController.delete); //Deleta um alerta específico (admin only)

// Rotas de Calibragem

routes.post("/calibrations", typeVerifyMiddleware("admin","tecnico"), schemaValidator(creatCalibragemSchema), CalibragemController.create); //Cria uma nova calibragem (admin, tecnico)
routes.get("/calibrations",typeVerifyMiddleware("admin","tecnico"), CalibragemController.index); //Lista todas as calibragens disponíveis (admin, tecnico)
routes.get("/calibrations/:id_tecnico/:id_sensor",typeVerifyMiddleware("admin","tecnico"), CalibragemController.show); //Pega os dados de uma calibragem específica
routes.delete("/calibrations/:id_tecnico/:id_sensor", typeVerifyMiddleware("admin","tecnico"), CalibragemController.delete); //Deleta uma calibragem específica (admin, tecnico)

//Rota para upload de arquivo 
routes.post("/upload", upload.single('file'), FileController.upload); 

module.exports = routes;
