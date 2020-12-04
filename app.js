const express = require('express');
const placesRoutes = require('./routes/places-routes');
const usersRouts = require('./routes/users-routes');
const errorController = require('./controllers/errorController');
const HttpError = require('./utils/http-error');
const app = express();

app.use(express.json());
app.use('/api/places', placesRoutes);
app.use('/api/users', usersRouts);
app.use((req, res, next) => {});
app.use(errorController);

app.use('*', (req, res, next) => {
  throw new HttpError('Can not found the page', 404);
  return;
});
app.listen(5000, () => {
  console.log('Listening port 5000');
});
