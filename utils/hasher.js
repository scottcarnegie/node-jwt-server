const bcrypt = require('bcrypt');

const saltRounds = 10;

const generateHash = async (plainTextPassword) => {
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(plainTextPassword, salt);
};

const validate = async (plainTextPassword, hash) => bcrypt.compare(plainTextPassword, hash);

module.exports = {
  generateHash,
  validate,
};
