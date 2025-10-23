const { Model, DataTypes } = require("sequelize");

class Alerta extends Model {
  static init(sequelize) {
    super.init(
      {
        id_alerta: { type: DataTypes.INTEGER, primaryKey: true },
        leitura_causa: DataTypes.INTEGER,
        tipo_alerta: DataTypes.STRING(80),
        nivel_severidade: {
          type: DataTypes.ENUM("Baixo", "Moderado", "Crítico"),
          defaultValue: "Crítico",
        },
        descricao_alerta: DataTypes.STRING(255),
        data_alerta: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: "alertas",
      }
    );
    return this;
  }
  static associate(models) {
    this.belongsTo(models.Leitura, {
      foreignKey: "leitura_causa",
      as: "leitura",
    });

    this.hasOne(models.Relatorio, {
      foreignKey: "alerta_analisado",
      as: "relatorio",
    });
  }
}

module.exports = Alerta;
