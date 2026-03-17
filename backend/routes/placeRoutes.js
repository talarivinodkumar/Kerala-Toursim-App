const express = require('express');
const router = express.Router();
const { getPlaces, getPlaceById, updatePlace } = require('../controllers/placeController');

router.route('/').get(getPlaces);
router.route('/:id').get(getPlaceById).put(updatePlace);

module.exports = router;
