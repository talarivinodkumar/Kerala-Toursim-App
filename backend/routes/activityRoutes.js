const express = require('express');
const router = express.Router();
const { getActivities, createActivity } = require('../controllers/activityController');

router.get('/', getActivities);
router.post('/', createActivity);

module.exports = router;
