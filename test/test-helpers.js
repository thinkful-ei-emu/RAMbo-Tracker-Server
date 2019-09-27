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

function getSampleSymptomSentByClient(){
  return {
    type:'symptom',
    time:'2019-09-25T21:14:10.168Z',
    symptom:'Sore eyes',
    severity:5
  }
}

function getSampleSymptomReturnedByServer(){
  return {
    type:'symptom',
    time:'2019-09-25T21:14:10.168Z',
    symptom:'Sore eyes',
    name:'Sore eyes',
    severity:'Extreme',
    severityNumber:5
  }
}

function postSymptomToServer(sym,auth){
  return supertest(app)
    .post('/api/event')
    .set('Authorization', auth)
    .send(sym);
}

function getSampleMealSentByClient(){
  return {
    type:'meal',
    time:'2019-09-25T19:14:10.168Z',
    name:'Lunch',
    items:[363898,598570,400223],
    
    //Note the bottom 2 will be ignored by server, just here for verifying the results of testing
    itemNames:{
      '363898':'ORGANIC RICE RAMEN', 
      '598570':'ORGANIC RAMEN NOODLES', 
      '400223':'RAMEN NOODLE SOUP'},
    ingredientsOf363898:['ORGANIC BROWN RICE FLOUR','ORGANIC WHITE RICE FLOUR','BAMBOO EXTRACT']
  }
}

function getSampleMealSentByClient2(){
  return {
    type:'meal',
    time:'2019-09-25T19:14:10.168Z',
    name:'Lunch',
    items:[363898],
    
    //Note the bottom 2 will be ignored by server, just here for verifying the results of testing
    itemNames:{
      '363898':'ORGANIC RICE RAMEN'},
    ingredientsOf363898:['ORGANIC BROWN RICE FLOUR','ORGANIC WHITE RICE FLOUR','BAMBOO EXTRACT']
  }
}

function getSampleMealReturnedByServer2(){
  return{
    type: 'meal',
    name: 'Lunch',
    time: '2019-09-25T19:14:10.168Z',
    items: [
      {
        name: 'ORGANIC RICE RAMEN',
        ingredients: [
          'ORGANIC BROWN RICE FLOUR',
          'ORGANIC WHITE RICE FLOUR',
          'BAMBOO EXTRACT'
        ],
        ndbno: '363898'
      }
    ]
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


//Doesn't seem to work for me when I do .expect 
//after what this function returns
//I.E. 
//helpers.postFoodsThenMealToServer(meal,auth)
//  .expect(201)
//Doesn't work, so I'm assuming that the design of supertest
//doesn't allow it to keep chaining supertest methods past the promise wrapper
async function postFoodsThenMealToServer(mealObj,auth){
  for(let i=0;i<mealObj.items.length;i++){
    await postFoodToServer(mealObj.items[i],auth)
  }
  return supertest(app)
      .post('/api/event')
      .set('Authorization', auth)
      .send(mealObj);
}

function postFoodsThenMealToServerExpect201(mealObj,auth){
  return Promise.all(mealObj.items.map(ndbno=>postFoodToServer(ndbno,auth)))
    .then(()=>{
      return supertest(app)
      .post('/api/event')
      .set('Authorization', auth)
      .send(mealObj)
      .expect(201);
    });
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
  postFoodToServer,
  getSampleMealSentByClient,
  postMealToServer,
  postFoodsThenMealToServer,
  postFoodsThenMealToServerExpect201,
  getSampleSymptomSentByClient,
  postSymptomToServer,
  getSampleMealSentByClient2,
  getSampleSymptomReturnedByServer,
  getSampleMealReturnedByServer2
};
