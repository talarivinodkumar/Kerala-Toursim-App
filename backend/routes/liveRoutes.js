const express = require('express');
const router = express.Router();
const { getLiveStats, updateLiveStats } = require('../controllers/liveController');

router.get('/stats', getLiveStats);
router.post('/update', updateLiveStats);

module.exports = router;
