const { Model, DataTypes } = require("sequelize");

class Trabalha extends Model {
  static init(sequelize) {
    super.init(
      {
        id_tecnico: { type: DataTypes.INTEGER, primaryKey: true },
        id_estacao: { type: DataTypes.INTEGER, primaryKey: true },
      },
      {
        sequelize,
        tableName: "trabalha",
      }
    );
    return this;
  }
  static associate(models) {
    this.belongsTo(models.Tecnico, {
      foreignKey: "id_tecnico",
      as: "tecnico",
    });

    this.belongsTo(models.EstacaoMonitoramento, {
      foreignKey: "id_estacao",
      as: "estacao",
    });
  }
}

module.exports = Trabalha;
