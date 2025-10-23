const { Model, DataTypes } = require("sequelize");

class Tecnico extends Model {
  static init(sequelize) {
    super.init(
      {
        id_usuario: { type: DataTypes.INTEGER, primaryKey: true },
        especializacao: DataTypes.STRING(100),
        disponibilidade: {
          type: DataTypes.ENUM("Integral", "Parcial", "Indisponível"),
          defaultValue: "Integral",
        },
        registro_profissional: DataTypes.STRING(50),
      },
      {
        sequelize,
        tableName: "tecnicos",
      }
    );
    return this;
  }
  static associate(models) {
    this.belongsTo(models.Usuario, {
      foreignKey: "id_usuario",
      as: "usuario",
    });

    this.hasMany(models.Atuacao, {
      foreignKey: "id_tecnico",
      as: "atuacoes",
    });

    this.hasMany(models.Calibragem, {
      foreignKey: "id_tecnico",
      as: "calibragens",
    });

    this.belongsToMany(models.EstacaoMonitoramento, {
      through: models.Trabalha,
      foreignKey: "id_tecnico",
      otherKey: "id_estacao",
      as: "estacoes",
    });
  }
}

module.exports = Tecnico;
