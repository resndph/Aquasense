const { Model, DataTypes } = require("sequelize");

class Atuacao extends Model {
  static init(sequelize) {
    super.init(
      {
        id_tecnico: { type: DataTypes.INTEGER, primaryKey: true },
        id_acao: { type: DataTypes.INTEGER, primaryKey: true },
      },
      {
        sequelize,
        tableName: "atuacoes",
      }
    );
    return this;
  }
  static associate(models) {
    this.belongsTo(models.Tecnico, {
      foreignKey: "id_tecnico",
      as: "tecnico",
    });

    this.belongsTo(models.AcaoCorretiva, {
      foreignKey: "id_acao",
      as: "acao",
    });
  }
}

module.exports = Atuacao;
