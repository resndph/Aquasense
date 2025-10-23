const { Model, DataTypes } = require("sequelize");

class Calibragem extends Model {
  static init(sequelize) {
    super.init(
      {
        id_tecnico: { type: DataTypes.INTEGER, primaryKey: true },
        id_sensor: { type: DataTypes.INTEGER, primaryKey: true },
        data: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: "calibragens",
      }
    );
    return this;
  }
  static associate(models) {
    this.belongsTo(models.Tecnico, {
      foreignKey: "id_tecnico",
      as: "tecnico",
    });

    this.belongsTo(models.Sensor, {
      foreignKey: "id_sensor",
      as: "sensor",
    });
  }
}

module.exports = Calibragem;
