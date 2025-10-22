"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("estacoes_monitoramento", {
      id_estacao: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      nome_estacao: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
      },
      cep: {
        type: Sequelize.STRING(9),
        allowNull: false,
        validate: { notEmpty: true },
      },
      logradouro: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: { notEmpty: true },
      },
      numero: {
        type: Sequelize.STRING(10),
        allowNull: false,
        validate: { notEmpty: true },
      },
      bairro: {
        type: Sequelize.STRING(60),
        allowNull: false,
        validate: { notEmpty: true },
      },
      cidade: {
        type: Sequelize.STRING(60),
        allowNull: false,
        validate: { notEmpty: true },
      },
      estado: {
        type: Sequelize.STRING(2),
        allowNull: false,
        validate: { notEmpty: true },
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      },
      data_ativacao: {
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
    await queryInterface.dropTable("estacoes_monitoramento");
  },
};
