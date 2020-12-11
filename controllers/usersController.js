const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../utils/http-error');
const User = require('../models/user');
const { create } = require('../models/user');

exports.getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({});
  } catch (e) {
    return next(
      HttpError('Could not find any users, in the internal service error ', 500)
    );
  }
  res.status(200).json({ users });
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

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (e) {
    return next(new HttpError('Could not create user, please try again', 500));
  }
  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (e) {
    const error = new HttpError('Creating user failed, please try again', 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      'asjidjc_sajdfi@sdfji',
      { expiresIn: '30d' }
    );
  } catch (err) {
    const error = new HttpError('Creating user failed, please try again', 500);
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createdUser, email: createdUser.email, token });
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
  if (!identifiedUser) {
    return next(
      new HttpError('Invalid credentials, could not log you in', 401)
    );
  }
  let isValidPassword;

  try {
    isValidPassword = await bcrypt.compare(password, identifiedUser.password);
  } catch (e) {
    return next(new HttpError('Could not match the password', 500));
  }
  if (!isValidPassword) {
    return next(
      new HttpError('Invalid credentials, could not log you in', 401)
    );
  }
  let token;
  try {
    token = jwt.sign(
      { userId: identifiedUser.id, email: identifiedUser.email },
      'asjidjc_sajdfi@sdfji',
      { expiresIn: '30d' }
    );
  } catch (err) {
    const error = new HttpError('Creating user failed, please try again', 500);
    return next(error);
  }
  res
    .status(200)
    .json({ userId: identifiedUser.id, email: identifiedUser.email, token });
};
