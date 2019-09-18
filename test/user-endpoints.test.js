const bcrypt = require('bcryptjs');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('User Endpoints', function() {
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
   * @description Register a user and populate their fields
   **/
  describe('POST /api/user', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    const requiredFields = ['username', 'password', 'display_name'];

    requiredFields.forEach((field) => {
      const registerAttemptBody = {
        username: 'test username',
        password: 'test password',
        display_name: 'test display_name'
      };

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete registerAttemptBody[field];

        return supertest(app)
          .post('/api/user')
          .send(registerAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`
          });
      });
    });

    it('responds 400 \'Password be longer than 8 characters\' when empty password', () => {
      const userShortPassword = {
        username: 'test username',
        password: '1234567',
        display_name: 'test display_name'
      };
      return supertest(app)
        .post('/api/user')
        .send(userShortPassword)
        .expect(400, { error: 'Password be longer than 8 characters' });
    });

    it('responds 400 \'Password be less than 72 characters\' when long password', () => {
      const userLongPassword = {
        username: 'test username',
        password: '*'.repeat(73),
        display_name: 'test display_name'
      };
      return supertest(app)
        .post('/api/user')
        .send(userLongPassword)
        .expect(400, { error: 'Password be less than 72 characters' });
    });

    it('responds 400 error when password starts with spaces', () => {
      const userPasswordStartsSpaces = {
        username: 'test username',
        password: ' 1Aa!2Bb@',
        display_name: 'test display_name'
      };
      return supertest(app)
        .post('/api/user')
        .send(userPasswordStartsSpaces)
        .expect(400, {
          error: 'Password must not start or end with empty spaces'
        });
    });

    it('responds 400 error when password ends with spaces', () => {
      const userPasswordEndsSpaces = {
        username: 'test username',
        password: '1Aa!2Bb@ ',
        display_name: 'test display_name'
      };
      return supertest(app)
        .post('/api/user')
        .send(userPasswordEndsSpaces)
        .expect(400, {
          error: 'Password must not start or end with empty spaces'
        });
    });

    it('responds 400 \'User name already taken\' when username isn\'t unique', () => {
      const duplicateUser = {
        username: testUser.username,
        password: '11AAaa!!',
        display_name: 'test display_name'
      };
      return supertest(app)
        .post('/api/user')
        .send(duplicateUser)
        .expect(400, { error: 'Username already taken' });
    });

    describe('Given a valid user', () => {
      it('responds 201, serialized user with no password', () => {
        const newUser = {
          username: 'test username',
          password: '11AAaa!!',
          display_name: 'test display_name'
        };
        return supertest(app)
          .post('/api/user')
          .send(newUser)
          .expect(201)
          .expect((res) => {
            expect(res.body).to.have.property('id');
            expect(res.body.username).to.eql(newUser.username);
            expect(res.body.name).to.eql(newUser.display_name);
            expect(res.body).to.not.have.property('password');
            expect(res.headers.location).to.eql(`/api/user/${res.body.id}`);
          });
      });

      it('stores the new user in db with bcryped password', () => {
        const newUser = {
          username: 'test username',
          password: '11AAaa!!',
          display_name: 'test display_name'
        };
        return supertest(app)
          .post('/api/user')
          .send(newUser)
          .expect((res) =>
            db
              .from('users')
              .select('*')
              .where({ id: res.body.id })
              .first()
              .then((row) => {
                expect(row.username).to.eql(newUser.username);
                expect(row.display_name).to.eql(newUser.display_name);

                return bcrypt.compare(newUser.password, row.password);
              })
              .then((compareMatch) => {
                expect(compareMatch).to.be.true;
              })
          );
      });
    });
  });
});
