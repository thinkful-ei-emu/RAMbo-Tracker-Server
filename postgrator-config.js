require('dotenv').config();
<<<<<<< HEAD
console.log(process.env.MIGRATION_DB_NAME);
=======
>>>>>>> 2eb6c0c5fd9c0196de528d7af78b7601d7784ea9
module.exports = {
  'migrationDirectory': 'migrations',
  'driver': 'pg',
  'host': process.env.MIGRATION_DB_HOST,
  'port': process.env.MIGRATION_DB_PORT,
  'database': process.env.MIGRATION_DB_NAME,
  'username': process.env.MIGRATION_DB_USER,
  'password': process.env.MIGRATION_DB_PASS
};
