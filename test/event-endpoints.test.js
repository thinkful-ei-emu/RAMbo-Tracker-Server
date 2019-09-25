const app = require('../src/app');
const helpers = require('./test-helpers');
describe.only('Food Endpoint', function() {
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
  describe('POST /meal',()=>{
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    /* it() */
  });


});