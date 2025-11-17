"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("sensores", {
      id_sensor: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      id_estacao_situado: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "estacoes_monitoramento",
          key: "id_estacao",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      tipo: {
        type: Sequelize.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      unidade_medida: {
        type: Sequelize.STRING(20),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      limite: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      status_sensor: {
        type: Sequelize.ENUM("Ativo", "Inativo", "Em manutenção"),
        allowNull: false,
        defaultValue: "Ativo",
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
    await queryInterface.dropTable("sensores");
  },
};
