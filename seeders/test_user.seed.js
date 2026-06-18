'use strict';
const hashPassword = require('../utils/bcrypt/hash.bcrypt.util');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        first_name: 'Test',
        middle_name: null,
        last_name: 'User',
        email: 'test@example.com',
        password: await hashPassword('password'),
        created_at: new Date(),
        updated_at: new Date(),
      },ss
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: 'test@example.com',
    });
  },
};