const jwt = require('jsonwebtoken');
const HttpError = require('../utils/http-error');

module.exports = (req, res, next) => {
  if (req.method == 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new Error('Authentication failed!');
    }
    const decodedToken = jwt.verify(token, 'asjidjc_sajdfi@sdfji');
    req.user = { id: decodedToken.userId };
    next();
  } catch (err) {
    return next(new HttpError('Authentication failed!', 401));
  }
};
