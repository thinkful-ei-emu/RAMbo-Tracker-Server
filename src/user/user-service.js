const bcrypt = require('bcryptjs');
const xss = require('xss');

const UserService = {
  hasUserWithUserName(db, username) {
    return db('users')
      .where({ username })
      .first()
      .then((user) => !!user);
  },

  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('users')
      .returning('*')
      .then(([user]) => user);
  },

  validatePassword(password) {
    if (password.length < 8) {
      return 'Password be longer than 8 characters';
    }
    if (password.length > 72) {
      return 'Password be less than 72 characters';
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces';
    }
    return null;
  },

  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },

  serializeUser(user) {
    return {
      id: user.id,
      name: xss(user.display_name),
      username: xss(user.username)
    };
  }
};

module.exports = UserService;
