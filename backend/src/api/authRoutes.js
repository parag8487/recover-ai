const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('./authController');
const auth = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);

module.exports = router;
