module.exports = (err, req, res, next) => {
  if (res.headerSent) return next(err);
  res.status(err.statusCode || 500);
  res.json({ message: err.message || 'An unknown error ' });
};
