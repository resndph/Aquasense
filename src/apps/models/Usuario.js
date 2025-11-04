const { Model, DataTypes } = require("sequelize");
const bcryptjs = require("bcryptjs");

class Usuario extends Model {
  static init(sequelize) {
    super.init(
      {
        id_usuario: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        nome: DataTypes.STRING(100),
        senha_hash: DataTypes.STRING,
        email: DataTypes.STRING(150),
        password: DataTypes.VIRTUAL,
        tipo: {
          type: DataTypes.VIRTUAL,
          get() {
            if (this.pesquisador) return "pesquisador";
            if (this.tecnico) return "tecnico";
            return "usuario";
          },
        },
      },
      {
        sequelize,
        tableName: "usuarios",
      }
    );
    this.addHook("beforeSave", async (user) => {
      if (user.password) {
        user.senha_hash = await bcryptjs.hash(user.password, 8);
      }
    });
    return this;
  }

  checkPassword(password) {
    return bcryptjs.compare(password, this.senha_hash);
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
