const fs = require('fs');
const HttpError = require('../utils/http-error');
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../utils/location');
const Place = require('../models/place');
const User = require('../models/user');
const mongoose = require('mongoose');
const user = require('../models/user');

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
  // let places;
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (e) {
    return next(new HttpError('Something went wrong, could not find a place'));
  }
  if (!userWithPlaces || userWithPlaces.length === 0) {
    const error = new HttpError(
      'Could not find  a place for the provided user id',
      404
    );
    return next(error);
  }
  res.json({ places: userWithPlaces.places });
};

exports.createPlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
  }
  const { title, description, address } = req.body;

  let coordinates;

  try {
    coordinates = await getCoordsForAddress(address);
  } catch (err) {
    return next(error);
  }
  const createdPlace = new Place({
    title,
    image: req.file.path,
    description,
    location: coordinates,
    address,
    creator: req.user.id,
  });

  let user;

  try {
    user = await User.findById(req.user.id);
  } catch (e) {
    return next(new HttpError('Creating place failed, please try again', 500));
  }
  if (!user) {
    return next(new HttpError('Could not find user for provided id', 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (e) {
    const error = new HttpError('Creating place failed, please try again', 500);
    return next(error);
  }
  res.status(201).json({ place: createdPlace });
};

exports.updatePlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    next(new HttpError('Invalid inputs passed, please check your data', 422));
  }
  const { title, description } = req.body;
  const { placeId } = req.params;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (e) {
    return next(
      new HttpError('Could not find the place, Something went wrong', 500)
    );
  }

  // this object id is mongoose id so must transfer to string
  if (place.creator.toString() !== req.user.id) {
    return next(new HttpError('You are not allow to edit this place', 401));
  }
  place.title = title;
  place.description = description;
  try {
    place.save();
  } catch (e) {
    return next(
      new HttpError('Could not update the place, Something went wrong', 500)
    );
  }
  res.status(200).json({ place });
};

exports.deletePlace = async (req, res, next) => {
  const { placeId } = req.params;

  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (e) {
    return next(
      new HttpError('Something went wrong, could not delete place', 500)
    );
  }

  if (!place) {
    return next(new HttpError('Could not find place for this id', 404));
  }

  if (place.creator.id !== req.user.id) {
    return next(
      new HttpError('You do not have the auth to delete the post', 401)
    );
  }
  const imagePath = place.image;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (e) {
    return next(
      new HttpError('Something went wrong, could not delete place', 500)
    );
  }

  fs.unlink(imagePath, (err) => console.log(err));

  res.status(200).json({});
};
