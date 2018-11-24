const UserDb = require('../schemas/user');
const logger = require('../utils/logger');
const hasher = require('../utils/hasher');

class User {
  constructor(userDb) {
    const { id, email } = userDb;

    this.id = id;
    this.email = email;

    this._user = userDb;
  }

  async setPassword(password) {
    const passwordHash = await hasher.generateHash(password);
    this._user.password = passwordHash;

    return new Promise((resolve, reject) => {
      this._user.save((err) => {
        if (err) {
          logger.error(`Error on setPassword for ${this.email}`);
          return reject(err);
        }

        return resolve(true);
      });
    });
  }

  static async authenticate({ email, password }) {
    const userDb = await UserDb.findOne({ email, status: true });

    if (!userDb) {
      return false;
    }

    return hasher.validate(password, userDb.password);
  }

  static async create({ email, password }) {
    const user = new UserDb({
      email,
      password: await hasher.generateHash(password),
      status: true,
    });

    return new Promise((resolve, reject) => {
      user.save((err) => {
        if (err) {
          if (err.code === 11000) {
            // Duplicate record error
            logger.error(`Error on user creation. Duplicate record blocked for ${email}.`);
            return resolve(null);
          }

          logger.error(`Unexpected error on user creation.Error ${err.message}`);
          return reject(err);
        }

        return resolve(new this({
          id: user.id,
          email: user.email,
        }));
      });
    });
  }

  static deactivateByEmail(email) {
    return new Promise((resolve, reject) => {
      UserDb.findOneAndUpdate({ email }, { status: false }, (err) => {
        if (err) {
          logger.error(`Error on delete user ${email}. Message: ${err.message}`);
          return reject(err);
        }

        return resolve(true);
      });
    });
  }

  static getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      UserDb.findOne({ email }, (err, user) => {
        if (err) {
          logger.error(`Error on GetUserByEmail for ${email}. Message: ${err.message}`);
          return reject(err);
        }

        return resolve(new this(user));
      });
    });
  }
}

module.exports = User;
