const usersController = require('../controllers/usersController');

const router = require('express').Router();

router.get('/', usersController.getUsers);

router.post('/signup', usersController.signup);
router.post('/login', usersController.login);

module.exports = router;
