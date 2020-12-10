const fs = require('fs');

module.exports = (err, req, res, next) => {
  //roll back
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) return next(err);
  res.status(err.statusCode || 500);
  res.json({ message: err.message || 'An unknown error ' });
};
