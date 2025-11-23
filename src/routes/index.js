const { Router } = require("express");
const AuthenticationMiddleware = require("../apps/middlewares/authentication");

const router = Router();

// Rotas públicas
router.get("/health", (req, res) => {res.send("O server esta online");}); 
router.use(require("./auth.routes"));
router.use(require("./sensorService.routes"));

router.use(require("./users.routes"));

// Middleware global de autenticação
router.use(AuthenticationMiddleware);

// Rotas autenticadas
router.use(require("./stations.routes"));
router.use(require("./reports.routes"));
router.use(require("./correctiveActions.routes"));
router.use(require("./sensors.routes"));
router.use(require("./readings.routes"));
router.use(require("./alerts.routes"));
router.use(require("./calibrations.routes"));
router.use(require("./file.routes")); 

module.exports = router;
