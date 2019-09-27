/* global supertest expect */
const app = require('../src/app');
const helpers = require('./test-helpers');
describe.only('Food Endpoint', function() {
  let db;

  const testUser = helpers.makeUsersArray()[0];

  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup and login', () =>helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));
  describe('GET /food/search/:search',()=>{
    beforeEach('insert users', () =>helpers.seedUsers(db,helpers.makeUsersArray()));/* 
    it('responds with 200') */
  });
  it('is protected',()=>{
    return supertest(app).post('/api/event')
      .send({hello:'hello'})
      .expect(401);
  });
  it('can get all events',()=>{
    return supertest(app).get('/api/event')
      .set({Authorization: helpers.makeAuthHeader(testUser)})
      .expect(200);
  });


});