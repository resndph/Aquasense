"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("trabalha", {
      id_tecnico: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tecnicos",
          key: "id_usuario",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        primaryKey: true,
      },
      id_estacao: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "estacoes_monitoramento",
          key: "id_estacao",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
    await queryInterface.dropTable("trabalha");
  },
};
