const { vˋ: uuid } = require('uuid');
const HttpError = require('../utils/http-error');
const DUMMY_USERS = [
  { id: 'u1', name: 'Simon Ho', email: 'test@test.com', password: 'testers' },
];
exports.getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

exports.signup = (req, res, next) => {
  const { name, email, password } = req.body;

  const hasUser = DUMMY_USERS.find((u) => u.email === email);
  if (hasUser)
    return next(
      new HttpError('The user email has been taken by someone ', 422)
    );

  const createdUser = {
    id: uuid(),
    name,
    email,
    password,
  };

  DUMMY_USERS.push(createdUser);

  res.status(201).json({ user: createdUser });
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
  if (!identifiedUser || identifiedUser.password !== password) {
    next(new HttpError('Can not find the user or match password', 404));
    return;
  }

  res.status(200).json({ message: 'Logged in' });
};
