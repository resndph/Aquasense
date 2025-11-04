const Sequelize = require("sequelize");

const Usuario = require("../apps/models/Usuario");
const Telefone = require("../apps/models/Telefone");
const Pesquisador = require("../apps/models/Pesquisador");
const Tecnico = require("../apps/models/Tecnico");
const EstacaoMonitoramento = require("../apps/models/EstacaoMonitoramento");
const Sensor = require("../apps/models/Sensor");
const Leitura = require("../apps/models/Leitura");
const Alerta = require("../apps/models/Alerta");
const Relatorio = require("../apps/models/Relatorio");
const AcaoCorretiva = require("../apps/models/AcaoCorretiva");
const Trabalha = require("../apps/models/Trabalha");
const Calibragem = require("../apps/models/Calibragem");
const Atuacao = require("../apps/models/Atuacao");

const models = [
  Usuario,
  Telefone,
  Pesquisador,
  Tecnico,
  EstacaoMonitoramento,
  Sensor,
  Leitura,
  Alerta,
  Relatorio,
  AcaoCorretiva,
  Trabalha,
  Calibragem,
  Atuacao,
];
const dbConfig = require("../configs/db");

class Database {
  constructor() {
    this.init();
  }
  init() {
    this.connection = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        define: dbConfig.define,
      }
    );
    models.map((model) => model.init(this.connection));
    models.map(
      (model) => model.associate && model.associate(this.connection.models)
    );
  }
}
module.exports = new Database();
