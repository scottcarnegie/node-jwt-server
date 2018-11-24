const router = require('express').Router();
const UserController = require('../../controllers/user');

router.post('/create', (req, res) => {
  UserController.create(req, res);
});

router.post('/login', (req, res) => {
  UserController.login(req, res);
});

router.get('/verify', (req, res) => {
  UserController.verify(req, res);
});

router.put('/deactivate', (req, res) => {
  UserController.deactivate(req, res);
});

router.put('/change-password', (req, res) => {
  UserController.changePassword(req, res);
});

router.put('/set-password', (req, res) => {
  UserController.setPassword(req, res);
});

module.exports = router;
