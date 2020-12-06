const { validationResult } = require('express-validator');

const HttpError = require('../utils/http-error');
const User = require('../models/user');

exports.getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({});
  } catch (e) {
    return next(
      HttpError('Could not find any users, in the internal service error ', 500)
    );
  }
  res.json({ users });
};

exports.signup = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
  }
  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (e) {
    return next(
      new HttpError('Signing up failed, please try again later'),
      500
    );
  }
  if (existingUser) {
    return next(
      new HttpError('User exists already, please login instead', 422)
    );
  }

  const createdUser = new User({
    name,
    email,
    image: 'https://live.staticflickr.com/7631/26849088292_36fc52ee90_b.jpg',
    password,
  });

  try {
    await createdUser.save();
  } catch (e) {
    const error = new HttpError('Creating user failed, please try again', 500);
    return next(error);
  }
  res.status(201).json({ user: createdUser });
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  let identifiedUser;

  try {
    identifiedUser = await User.findOne({ email });
  } catch (e) {
    return next(
      new HttpError(
        'Could not find the user by emaill, something went wrong',
        500
      )
    );
  }
  if (!identifiedUser || identifiedUser.password !== password) {
    next(new HttpError('Can not find the user or match password', 404));
    return;
  }

  res.status(200).json({ message: 'Logged in' });
};
