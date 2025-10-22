"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("atuacoes", {
      id_tecnico: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tecnicos",
          key: "id_usuario",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        primaryKey: true,
      },
      id_acao: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "acoes_corretivas",
          key: "id_acao",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        primaryKey: true,
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
    await queryInterface.dropTable("atuacoes");
  },
};
