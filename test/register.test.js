/* global supertest  */
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Register Endpoints', function() {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  let required = ['username','password','display_name'];
  for(let field of required){
    let data = {username:'user1',password:'password',display_name:'test user jr'};
    data[field] = '';
    it(`returns a 400 when missing ${field}`,()=>{
      return supertest
        .post('/user')
        .send(data)
        .expect(400);});
    
  }
});