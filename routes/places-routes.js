const placesController = require('../controllers/placesController');
const { check } = require('express-validator');

const router = require('express').Router();
router.post(
  '/',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty(),
  ],
  placesController.createPlace
);
router.get('/:placeId', placesController.findPlaceByPlaceId);
router.patch(
  '/:placeId',
  [check('title').not().isEmpty(), check('description').isLength({ min: 5 })],
  placesController.updatePlace
);
router.delete('/:placeId', placesController.deletePlace);

router.get('/user/:uid', placesController.findPlacesByUserId);
module.exports = router;
