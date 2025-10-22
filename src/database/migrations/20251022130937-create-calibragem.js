"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("calibragens", {
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
      id_sensor: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "sensores",
          key: "id_sensor",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        primaryKey: true,
      },
      data: {
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
    await queryInterface.dropTable("calibragens");
  },
};
