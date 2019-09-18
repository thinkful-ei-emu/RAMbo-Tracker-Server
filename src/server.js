<<<<<<< HEAD
<<<<<<< HEAD
require('dotenv').config()
=======
require("dotenv").config();

>>>>>>> 2eb6c0c5fd9c0196de528d7af78b7601d7784ea9
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

<<<<<<< HEAD
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
=======
app.set('db', db);
>>>>>>> 2eb6c0c5fd9c0196de528d7af78b7601d7784ea9

app.listen(PORT,()=>{
console.log(`Server is listening on port ${PORT}`);
});

