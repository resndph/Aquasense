const { Model, DataTypes } = require("sequelize");

class Usuario extends Model {
  static init(sequelize) {
    super.init(
      {
        id_usuario: { type: DataTypes.INTEGER, primaryKey: true },
        nome: DataTypes.STRING(100),
        senha_hash: DataTypes.STRING,
        email: DataTypes.STRING(150),
        password: DataTypes.VIRTUAL,
      },
      {
        sequelize,
        tableName: "usuarios",
      }
    );
    return this;
  }
  static associate(models) {
    this.hasMany(models.TelefoneContato, {
      foreignKey: "id_usuario",
      as: "telefones",
    });

    this.hasOne(models.Pesquisador, {
      foreignKey: "id_usuario",
      as: "pesquisador",
    });

    this.hasOne(models.Tecnico, {
      foreignKey: "id_usuario",
      as: "tecnico",
    });
  }
}

module.exports = Usuario;
