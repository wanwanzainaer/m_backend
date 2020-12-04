const placesController = require('../controllers/placesController');
const router = require('express').Router();

router.post('/', placesController.createPlace);
router.get('/:placeId', placesController.findPlaceByPlaceId);
router.patch('/:placeId', placesController.updatePlace);
router.delete('/:placeId', placesController.deletePlace);

router.get('/user/:uid', placesController.findPlacesByUserId);
module.exports = router;
