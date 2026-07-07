'use strict';

const serviceStatuses = ['UNPAID', 'PENDING', 'PAID', 'EXPIRED', 'CANCELLED'];

module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === 'postgres') {
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_services_status" ADD VALUE IF NOT EXISTS 'PENDING';
        ALTER TYPE "enum_services_status" ADD VALUE IF NOT EXISTS 'EXPIRED';
        ALTER TYPE "enum_services_status" ADD VALUE IF NOT EXISTS 'CANCELLED';
      `);
      return;
    }

    await queryInterface.changeColumn('services', 'status', {
      type: Sequelize.ENUM(...serviceStatuses),
      allowNull: false,
      defaultValue: 'UNPAID',
    });
  },

  async down(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === 'postgres') {
      return;
    }

    await queryInterface.changeColumn('services', 'status', {
      type: Sequelize.ENUM('UNPAID', 'PAID'),
      allowNull: false,
      defaultValue: 'UNPAID',
    });
  },
};
