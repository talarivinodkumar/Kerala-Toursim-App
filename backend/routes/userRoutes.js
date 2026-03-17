const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword, resetPassword, getUserById, getAllUsers, getCurrentUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getAllUsers);
router.get('/me', getCurrentUser);
router.get('/:id', getUserById);
router.post('/', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;
