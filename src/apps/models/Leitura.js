const { Model, DataTypes } = require("sequelize");

class Leitura extends Model {
  static init(sequelize) {
    super.init(
      {
        id_leitura: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        id_sensor_autor: DataTypes.INTEGER,
        limite: DataTypes.FLOAT,
        valor: DataTypes.FLOAT,
        data_hora: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: "leituras",
      }
    );
    return this;
  }
  static associate(models) {
    this.belongsTo(models.Sensor, {
      foreignKey: "id_sensor_autor",
      as: "sensor",
    });

    this.hasOne(models.Alerta, {
      foreignKey: "leitura_causa",
      as: "alerta",
    });
  }
}

module.exports = Leitura;
