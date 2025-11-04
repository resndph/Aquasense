const { Model, DataTypes } = require("sequelize");

class Relatorio extends Model {
  static init(sequelize) {
    super.init(
      {
        id_relatorio: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        pesquisador_resp: DataTypes.INTEGER,
        alerta_analisado: DataTypes.INTEGER,
        titulo: DataTypes.STRING(100),
        descricao: DataTypes.TEXT,
        data_emissao: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: "relatorios",
      }
    );
    return this;
  }
  static associate(models) {
    this.belongsTo(models.Pesquisador, {
      foreignKey: "pesquisador_resp",
      as: "pesquisador",
    });

    this.belongsTo(models.Alerta, {
      foreignKey: "alerta_analisado",
      as: "alerta",
    });

    this.hasMany(models.AcaoCorretiva, {
      foreignKey: "relatorio_autor",
      as: "acoes_corretivas",
    });
  }
}

module.exports = Relatorio;
