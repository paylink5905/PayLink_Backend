'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('payment_links', 'razorpay_link_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true
    });

    await queryInterface.addColumn('payment_links', 'razorpay_short_url', {
      type: Sequelize.STRING(500),
      allowNull: true
    });

    await queryInterface.addColumn('payment_links', 'razorpay_status', {
      type: Sequelize.STRING(50),
      allowNull: true
    });

    await queryInterface.addColumn('payment_links', 'razorpay_error', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('payment_links', 'razorpay_link_id');
    await queryInterface.removeColumn('payment_links', 'razorpay_short_url');
    await queryInterface.removeColumn('payment_links', 'razorpay_status');
    await queryInterface.removeColumn('payment_links', 'razorpay_error');
  }
};
