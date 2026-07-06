'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('services', 'name', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    await queryInterface.changeColumn('services', 'phone', {
      type: Sequelize.STRING(20),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('services', 'name', {
      type: Sequelize.STRING(100),
      allowNull: false,
    });

    await queryInterface.changeColumn('services', 'phone', {
      type: Sequelize.STRING(20),
      allowNull: false,
    });
  },
};
