const knex = require('knex');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeKnexInstance() {
  return knex({
    client: 'pg',
    connection: process.env.TEST_DB_URL
  });
}

function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'test-user-1',
      display_name: 'Test user 1',
      password: 'password'
    },
    {
      id: 2,
      username: 'test-user-2',
      display_name: 'Test user 2',
      password: 'password'
    }
  ];
}

/**
 * make a bearer token with jwt for authorization header
 */
function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256'
  });
  return `Bearer ${token}`;
}

/**
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
  seedUsers
};
