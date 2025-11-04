const { Model, DataTypes } = require("sequelize");

class AcaoCorretiva extends Model {
  static init(sequelize) {
    super.init(
      {
        id_acao: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        relatorio_autor: DataTypes.INTEGER,
        descricao_acao: DataTypes.TEXT,
        status_acao: {
          type: DataTypes.ENUM("Pendente", "Em andamento", "Concluída"),
          defaultValue: "Pendente",
        },
        data_execucao: DataTypes.DATE,
      },
      {
        sequelize,
        tableName: "acoes_corretivas",
      }
    );
    return this;
  }
  static associate(models) {
    this.belongsTo(models.Relatorio, {
      foreignKey: "relatorio_autor",
      as: "relatorio",
    });

    this.hasMany(models.Atuacao, {
      foreignKey: "id_acao",
      as: "atuacoes",
    });
  }
}

module.exports = AcaoCorretiva;
