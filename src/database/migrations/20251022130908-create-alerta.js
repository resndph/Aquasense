"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("alertas", {
      id_alerta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      leitura_causa: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "leituras",
          key: "id_leitura",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      tipo_alerta: {
        type: Sequelize.STRING(80),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      nivel_severidade: {
        type: Sequelize.ENUM("Baixo", "Moderado", "Crítico"),
        allowNull: false,
        defaultValue: "Crítico",
      },
      descricao_alerta: {
        type: Sequelize.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      data_alerta: {
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
    await queryInterface.dropTable("alertas");
  },
};
