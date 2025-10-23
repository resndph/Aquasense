const { Model, DataTypes } = require("sequelize");

class Sensor extends Model {
  static init(sequelize) {
    super.init(
      {
        id_sensor: { type: DataTypes.INTEGER, primaryKey: true },
        id_estacao_situado: DataTypes.INTEGER,
        tipo: DataTypes.STRING(50),
        unidade_medida: DataTypes.STRING(20),
        status_sensor: {
          type: DataTypes.ENUM("Ativo", "Inativo", "Em manutenção"),
          defaultValue: "Ativo",
        },
      },
      {
        sequelize,
        tableName: "sensores",
      }
    );
    return this;
  }
  static associate(models) {
    this.belongsTo(models.EstacaoMonitoramento, {
      foreignKey: "id_estacao_situado",
      as: "estacao",
    });

    this.hasMany(models.Leitura, {
      foreignKey: "id_sensor_autor",
      as: "leituras",
    });

    this.hasMany(models.Calibragem, {
      foreignKey: "id_sensor",
      as: "calibragens",
    });
  }
}

module.exports = Sensor;
