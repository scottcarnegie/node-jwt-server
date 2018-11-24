const jwt = require('jsonwebtoken');
const { TOKEN_SECRET } = require('../config');
const logger = require('./logger');

const secret = Buffer.from(TOKEN_SECRET, 'base64');

class Jwt {
  static generate({ payload, audience = 'tidbytes.ca', expiresIn = 86400 }) {
    return new Promise((resolve) => {
      jwt.sign(
        payload,
        secret,
        {
          algorithm: 'HS256',
          audience,
          expiresIn,
          issuer: 'tidbytes.ca',
        },
        (err, token) => { resolve(token); },
      );
    });
  }

  static async verifyAndDecode(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, { algorithms: ['HS256'], issuer: 'tidbytes.ca' }, (err, decoded) => {
        if (err) {
          logger.error(`Error while validating JWT. Message: ${err.message}`);
          return reject(err);
        }

        return resolve(decoded);
      });
    });
  }
}

module.exports = Jwt;
