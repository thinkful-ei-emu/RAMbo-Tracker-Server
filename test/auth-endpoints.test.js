
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('Auth Endpoints', function() {
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

  /**
   * @description Get token for login
   **/
  describe('POST /api/auth/token', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    const requiredFields = ['username', 'password'];

    requiredFields.forEach((field) => {
      const loginAttemptBody = {
        username: testUser.username,
        password: testUser.password
      };

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete loginAttemptBody[field];


        return supertest(app)
          .post('/api/auth/token')
          .send(loginAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`
          });
      });
    });

    it('responds 401 \'invalid username or password\' when bad username', () => {
      const userInvalidUser = { username: 'user-not', password: 'existy' };
      return supertest(app)
        .post('/api/auth/token')
        .send(userInvalidUser)
        .expect(401, { error: 'Incorrect username or password' });
    });

    it('responds 401 \'invalid username or password\' when bad password', () => {
      const userInvalidPass = {
        username: testUser.username,
        password: 'incorrect'
      };
      return supertest(app)
        .post('/api/auth/token')
        .send(userInvalidPass)
        .expect(401, { error: 'Incorrect username or password' });
    });

    it('responds 200 and JWT auth token using secret when valid credentials', () => {
      const userValidCreds = {
        username: testUser.username,
        password: testUser.password
      };
      const expectedToken = jwt.sign(
        { user_id: testUser.id, display_name: testUser.display_name },
        process.env.JWT_SECRET,
        {
          subject: testUser.username,
          expiresIn: process.env.JWT_EXPIRY,
          algorithm: 'HS256'
        }
      );
      return supertest(app)
        .post('/api/auth/token')
        .send(userValidCreds)
        .expect(200, {
          authToken: expectedToken
        });
    });
  });
});

