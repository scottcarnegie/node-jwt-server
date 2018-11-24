const basicAuth = require('basic-auth');

const decodeBasicAuth = (req, res, next) => {
  const credentials = basicAuth(req);

  if (credentials) {
    const { name, pass } = credentials;

    req.basic = {
      username: name,
      password: pass,
    };
  }

  next();
};

module.exports = decodeBasicAuth;
