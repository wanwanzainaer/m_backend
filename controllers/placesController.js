const { v4: uuid } = require('uuid');
const HttpError = require('../utils/http-error');
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../utils/location');
const Place = require('../models/place');

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

exports.findPlaceByPlaceId = async (req, res, next) => {
  const { placeId } = req.params;
  if (!placeId) return res.status(404).json({ message: 'No Found this page' });
  // Place.findById().exec()

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (e) {
    return next(
      new HttpError('Something went wrong, could not find a place'),
      500
    );
  }
  if (!place) {
    const error = new HttpError(
      'Could not find  a place for the provided id',
      404
    );
    return next(error);
  }
  res.json({ place });
};

exports.findPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (e) {
    return next(new HttpError('Something went wrong, could not find a place'));
  }
  if (!places || places.length === 0) {
    const error = new HttpError(
      'Could not find  a place for the provided user id',
      404
    );
    return next(error);
  }
  res.json({ places });
};

exports.createPlace = async (req, res, next) => {
  console.log(req.body);
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
  }
  const { title, description, address, creator } = req.body;

  let coordinates;

  try {
    coordinates = await getCoordsForAddress(address);
  } catch (err) {
    return next(error);
  }
  const createdPlace = new Place({
    title,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/400px-Empire_State_Building_%28aerial_view%29.jpg',
    description,
    location: coordinates,
    address,
    creator,
  });

  try {
    await createdPlace.save();
  } catch (e) {
    const error = new HttpError('Creating place failed, please try again', 500);
    return next(error);
  }
  res.status(201).json({ place: createdPlace });
};

exports.updatePlace = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    next(new HttpError('Invalid inputs passed, please check your data', 422));
  }
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
  const { placeId } = req.params;

  if (!DUMMY_PLACES.find((p) => p.id !== placeId)) {
    return next(HttpError('Could not find a place the place for that id', 404));
  }
  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
  res.status(200).json({});
};
