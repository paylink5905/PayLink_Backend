require('dotenv').config();

module.exports = {
  development: {
    username: "root",
    password: null,
    database: "mpoket_db",
    host: "127.0.0.1",
    dialect: "mysql"
  },

  production: {
    username: "neondb_owner",
    password: "npg_eOPd3DQM1zsV",
    database: "neondb",
    host: "ep-ancient-fog-aongi2j5-pooler.c-2.ap-southeast-1.aws.neon.tech",
    port: 5432,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
