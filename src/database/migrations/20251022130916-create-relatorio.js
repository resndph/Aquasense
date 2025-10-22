"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("relatorios", {
      id_relatorio: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      pesquisador_resp: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "pesquisadores",
          key: "id_usuario",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      alerta_analisado: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "alertas",
          key: "id_alerta",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      titulo: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      data_emissao: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("relatorios");
  },
};
