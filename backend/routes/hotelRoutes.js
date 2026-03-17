const express = require('express');
const router = express.Router();
const { getHotels, createHotel, createRoom } = require('../controllers/hotelController');

router.get('/', getHotels);
router.post('/', createHotel);
router.post('/room', createRoom);

module.exports = router;
