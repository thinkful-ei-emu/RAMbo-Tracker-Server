<<<<<<< HEAD
require('dotenv').config()
const app = require('./app');
const {PORT, DB_URL} = require('./config');
const knex = require('knex')

const db = knex({
  client: 'pg',
  connection: DB_URL
})

app.set('db', db)
=======
require("dotenv").config();

const app = require('./app');
const {PORT, DB_URL} = require('./config');
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: DB_URL
})

app.set('db', db);

app.set('db', db);
>>>>>>> d7ea2880fd9b8fad3bea19c28dd338fab60535de

app.listen(PORT,()=>{
console.log(`Server is listening on port ${PORT}`);
});

