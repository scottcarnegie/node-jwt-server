const statusCodes = require('http-status-codes');
const Jwt = require('../utils/jwt');
const User = require('../models/user');


class UserController {
  static create(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(statusCodes.BAD_REQUEST).send({
        message: 'Email and password must be specified.',
      });
    }

    const { aud } = req.query;

    return User.create({ email, password })
      .then(async (user) => {
        if (!user) {
          return res.status(statusCodes.CONFLICT).send({});
        }

        const tokenDefinition = {
          payload: {
            email,
          },
        };

        if (aud) {
          tokenDefinition.audience = aud;
        }

        const token = await Jwt.generate(tokenDefinition);

        return res.status(statusCodes.CREATED).send({ token });
      })
      .catch(() => res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: 'An error occurred on user creation.' }));
  }

  static async login(req, res) {
    if (!req.basic) {
      return res.status(statusCodes.BAD_REQUEST).send();
    }

    const { username, password } = req.basic;

    const tokenDefinition = {
      payload: {
        email: username,
      },
    };

    const { aud } = req.query;
    if (aud) {
      tokenDefinition.audience = aud;
    }

    if (await User.authenticate({ email: username, password })) {
      const token = await Jwt.generate(tokenDefinition);
      return res.status(statusCodes.OK).send({ token });
    }
    return res.status(statusCodes.NOT_FOUND).send();
  }

  static async verify(req, res) {
    if (!req.query.token) {
      return res.status(400).send({
        message: 'Param token required.',
      });
    }

    let decoded;
    let error;

    const { aud } = req.query;

    try {
      if (aud) {
        decoded = await Jwt.verifyAndDecode(req.query.token, { audience: aud });
      } else {
        decoded = await Jwt.verifyAndDecode(req.query.token);
      }
    } catch (err) {
      error = err;
    }

    return res
      .status(statusCodes.OK)
      .send({
        token: decoded || null,
        message: error ? 'Invalid token.' : null,
      });
  }

  static async deactivate(req, res) {
    if (!req.query.email) {
      return res.status(statusCodes.BAD_REQUEST).send({
        message: 'Email must be passed in query string.',
      });
    }

    try {
      const result = await User.deactivateByEmail(req.query.email);
      if (result) {
        return res.status(statusCodes.OK).send();
      }
      return res.status(statusCodes.NOT_FOUND).send();
    } catch (err) {
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).send();
    }
  }

  static async changePassword(req, res) {
    const { currentPassword, newPassword, username } = req.body;

    if (!currentPassword || !newPassword || !username) {
      return res.status(statusCodes.BAD_REQUEST).send();
    }

    if (await User.authenticate({ email: username, password: currentPassword })) {
      // Set new password
      const user = await User.getUserByEmail(username);
      if (await user.setPassword(newPassword)) {
        return res.status(statusCodes.OK).send();
      }

      return res.status(statusCodes.INTERNAL_SERVER_ERROR).send();
    }

    return res.status(statusCodes.UNAUTHORIZED).send();
  }

  static async setPassword(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(statusCodes.BAD_REQUEST).send({ message: 'USERNAME and PASSWORD must be specified in the request body.' });
    }

    const user = await User.getUserByEmail(username);
    if (!await user.setPassword(password)) {
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).send();
    }

    return res.status(statusCodes.OK).send();
  }
}

module.exports = UserController;
