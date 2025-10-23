const { Model, DataTypes } = require("sequelize");

class EstacaoMonitoramento extends Model {
  static init(sequelize) {
    super.init(
      {
        id_estacao: { type: DataTypes.INTEGER, primaryKey: true },
        nome_estacao: DataTypes.STRING(100),
        cep: DataTypes.STRING(9),
        logradouro: DataTypes.STRING(100),
        numero: DataTypes.STRING(10),
        bairro: DataTypes.STRING(60),
        cidade: DataTypes.STRING(60),
        estado: DataTypes.STRING(2),
        latitude: DataTypes.DECIMAL(10, 8),
        longitude: DataTypes.DECIMAL(11, 8),
        data_ativacao: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: "estacoes_monitoramento",
      }
    );
    return this;
  }
  static associate(models) {
    this.hasMany(models.Sensor, {
      foreignKey: "id_estacao_situado",
      as: "sensores",
    });

    this.belongsToMany(models.Tecnico, {
      through: models.Trabalha,
      foreignKey: "id_estacao",
      otherKey: "id_tecnico",
      as: "tecnicos",
    });
  }
}

module.exports = EstacaoMonitoramento;
