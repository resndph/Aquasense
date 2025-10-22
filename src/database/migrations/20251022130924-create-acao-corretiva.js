"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("acoes_corretivas", {
      id_acao: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      relatorio_autor: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "relatorios",
          key: "id_relatorio",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      descricao_acao: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      status_acao: {
        type: Sequelize.ENUM("Pendente", "Em andamento", "Concluída"),
        allowNull: false,
        defaultValue: "Pendente",
      },
      data_execucao: {
        type: Sequelize.DATE,
        allowNull: true,
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
    await queryInterface.dropTable("acoes_corretivas");
  },
};
