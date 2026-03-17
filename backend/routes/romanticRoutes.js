const express = require('express');
const router = express.Router();
const { getMessages, createMessage } = require('../controllers/romanticController');

router.route('/').get(getMessages).post(createMessage);

module.exports = router;
