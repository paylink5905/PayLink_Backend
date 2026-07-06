'use strict';

const hashPassword = require('../utils/bcrypt/hash.bcrypt.util');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        first_name: 'Krishna',
        middle_name: null,
        last_name: 'Patel',
        email: 'krishna@mpoket.com',
        password: await hashPassword('Krishna_004'),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: 'krishna@mpoket.com',
    });
  },
};
