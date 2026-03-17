const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getAllBookings, updateBookingStatus } = require('../controllers/bookingController');

router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/', getAllBookings);
router.put('/:id', updateBookingStatus);

module.exports = router;
