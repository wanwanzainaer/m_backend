const placesController = require('../controllers/placesController');
const router = require('express').Router();

router.get('/:placeId', placesController.findPlaceByPlaceId);
router.patch('/:placeId', placesController.updatePlace);

router.get('/user/:uid', placesController.findPlaceByUserId);
router.post('/', placesController.createPlace);
module.exports = router;
