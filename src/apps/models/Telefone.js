const { Model, DataTypes } = require("sequelize");

class TelefoneContato extends Model {
  static init(sequelize) {
    super.init(
      {
        id_telefone: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        id_usuario: DataTypes.INTEGER,
        telefone_contato: DataTypes.STRING(20),
      },
      {
        sequelize,
        tableName: "telefones_contato",
      }
    );
    return this;
  }
  static associate(models) {
    this.belongsTo(models.Usuario, {
      foreignKey: "id_usuario",
      as: "usuario",
    });
  }
}

module.exports = TelefoneContato;
