const { Model, DataTypes } = require("sequelize");

class Pesquisador extends Model {
  static init(sequelize) {
    super.init(
      {
        id_usuario: { type: DataTypes.INTEGER, primaryKey: true },
        area_atuacao: DataTypes.STRING(100),
        instituicao_vinculo: DataTypes.STRING(150),
        nivel_formacao: DataTypes.STRING(100),
      },
      {
        sequelize,
        tableName: "pesquisadores",
      }
    );
    return this;
  }
  static associate(models) {
    this.belongsTo(models.Usuario, {
      foreignKey: "id_usuario",
      as: "usuario",
    });

    this.hasMany(models.Relatorio, {
      foreignKey: "pesquisador_resp",
      as: "relatorios",
    });
  }
}

module.exports = Pesquisador;
