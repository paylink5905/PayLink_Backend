'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('services', 'type', {
      type: Sequelize.ENUM('LOAN', 'ONE_TIME', 'PRODUCT'),
      allowNull: false,
      defaultValue: 'ONE_TIME',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('services', 'type', {
      type: Sequelize.ENUM('LOAN', 'ONE_TIME', 'PRODUCT'),
      allowNull: false,
    });
  },
};
