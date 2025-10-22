"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tecnicos", {
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "usuarios",
          key: "id_usuario",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      especializacao: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: { notEmpty: true },
      },
      disponibilidade: {
        type: Sequelize.ENUM("Integral", "Parcial", "Indisponível"),
        allowNull: false,
        defaultValue: "Integral",
      },
      registro_profissional: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
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
    await queryInterface.dropTable("tecnicos");
  },
};
