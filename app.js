const express = require('express');
const placesRoutes = require('./routes/places-routes');
const app = express();

// app.use(express.)
app.use('/', placesRoutes);
app.listen(5000, () => {
  console.log('Listening port 5000');
});
