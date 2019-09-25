const knex = require("knex");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require('../src/config');
const app = require('../src/app');

/**
 * create a knex instance connected to postgres

 */
function makeKnexInstance() {
  return knex({
    client: "pg",
    connection: process.env.TEST_DB_URL
  });
}

function getSampleMealSentByClient(){
  return {
    type:'meal',
    time:'',
    name:'Lunch',
    items:[363898,598570,400223]
  }
}

function postFoodToServer(ndbno,auth){
  return supertest(app)
    .post('/api/food')
    .set('Authorization', auth)
    .send({ndbno});
}

function postMealToServer(mealObj,auth){
  return supertest(app)
  .post('/api/event')
  .set('Authorization', auth)
  .send(mealObj);
}

function makeUsersArray() {
  return [
    {
      id: 1,
      username: "test-user-1",
      display_name: "Test user 1",
      password: "password"
    },
    {
      id: 2,
      username: "test-user-2",
      display_name: "Test user 2",
      password: "password"
    }
  ];
}

/**
 * generate fixtures of meals for a given user
 * @param {object} user - contains `id` property
 * @returns {Array(meals)} - arrays of languages and words
 */
function makeMealFoodsPlatesIngredients(user) {
  const meals = [
    {
      id: 1,
      user_id: user.id
    },
    {
      id: 2,
      user_id: user.id
    }
  ];

  const foods = [
    {
      id: 1,
      ndbno: 45166992,
      name: "ABC Peanut Butter"
    },
    {
      id: 2,
      ndbno: 45130738,
      name: "ACT II Butter Lovers Popcorn, UNPREPARED, GTIN: 00076150011159"
    },
    {
      id: 3,
      ndbno: 45135020,
      name: "ACT II Extreme Butter, UNPREPARED, GTIN: 00076150232097"
    }
  ];

  const plates = [
    {
      id: 1,
      meal: 1,
      food: 45166992
    },
    {
      id: 2,
      meal: 1,
      food: 45130738
    },
    {
      id: 3,
      meal: 2,
      food:  45135020
    }
  ];

  /* const ingredients; =  [
    {
      id:
      name:
      food:
    }
  ]; */

  return [meals, foods, plates/* , ingredients */];
}

/**
 * make a bearer token with jwt for authorization header
 */
function makeAuthHeader(user, secret = config.JWT_SECRET) {
  const payload = {
    user_id: user.id,
    name: user.display_name
  };

  const subject = user.username;

  const token = jwt.sign(payload, secret, {
    subject,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
  return `Bearer ${token}`;
}

/**
 * remove data from tables and reset sequences for SERIAL id fields
 */
function cleanTables(db) {
  return db.transaction((trx) =>
    trx
      .raw(
        `TRUNCATE
        "users" CASCADE`
      )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('users_id_seq', 0)`)
        ])
      )
  );
}

/**
 * insert users into db with bcrypted passwords and update sequence
 */
function seedUsers(db, users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db.transaction(async (trx) => {
    await trx.into('users').insert(preppedUsers);

    await trx.raw(`SELECT setval('users_id_seq', ?)`, [
      users[users.length - 1].id
    ]);
  });
}

module.exports = {
  makeKnexInstance,
  makeUsersArray,
  makeAuthHeader,
  cleanTables,
  seedUsers,
  postFoodToServer
};
