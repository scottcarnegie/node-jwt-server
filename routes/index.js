const router = require('express').Router();
const statusCodes = require('http-status-codes');

router.get('/', (req, res) => (
  res
    .status(statusCodes.OK)
    .send({ message: 'JWT server is running.' })
));

module.exports = router;
