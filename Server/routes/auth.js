// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/AuthController');
const authenticateUser = require('../middleware/authMiddleware');


router.post('/logout', userController.logoutUser);
router.post('/refresh', userController.refreshToken);
router.post('/create', userController.createUser);
router.post('/login', userController.loginUser);
// Protected route example
router.get('/profile', authenticateUser, (req, res) => {
  res.json({ message: 'User is authenticated!', user: req.user });
});


module.exports = router;
