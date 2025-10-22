const Sequelize = require("sequelize");

const dbConfig = require("../configs/db");

class Database {
  constructor() {
    this.init();
  }
  init() {}
}
module.exports = new Database();
