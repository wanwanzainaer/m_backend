const usersController = require('../controllers/usersController');
const { check } = require('express-validator');
const router = require('express').Router();
const fileUpload = require('../middleware/file-upload');

router.get('/', usersController.getUsers);

router.post(
  '/signup',
  fileUpload.single('image'),
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  usersController.signup
);
router.post('/login', usersController.login);

module.exports = router;

//test push
