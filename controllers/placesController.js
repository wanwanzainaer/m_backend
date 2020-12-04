const { v4: uuid } = require('uuid');

const HttpError = require('../utils/http-error');
let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world!',
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: '20 W 34th St, New York, NY 10001',
    creator: 'u1',
  },
];

exports.findPlaceByPlaceId = (req, res, next) => {
  const { placeId } = req.params;
  if (!placeId) return res.status(404).json({ message: 'No Found this page' });
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });
  if (!place) {
    const error = new HttpError(
      'Could not find  a place for the provided id',
      404
    );
    return next(error);
  }
  res.json({ place });
};

exports.findPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((p) => {
    return p.creator === userId;
  });
  if (!places || places.length === 0) {
    const error = new HttpError(
      'Could not find  a place for the provided user id',
      404
    );
    return next(error);
  }
  res.json({ places });
};

exports.createPlace = (req, res, next) => {
  const { title, description, coordinates, address, creator } = req.body;
  const createdPlace = {
    id: uuid(),
    description,
    location: coordinates,
    address,
    creator,
  };
  DUMMY_PLACES.push(createdPlace);

  res.status(201).json({ place: createdPlace });
};

exports.updatePlace = (req, res, next) => {
  const { title, description } = req.body;
  const { placeId } = req.params;
  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace;

  res.status(200).json({ place: updatedPlace });
};

exports.deletePlace = (req, res, next) => {
  console.log('here');
  const { placeId } = req.params;
  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
  console.log('Delete place');
  res.status(200).json({});
};
