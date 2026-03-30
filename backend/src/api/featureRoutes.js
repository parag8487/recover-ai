const express = require('express');
const router = express.Router();
const { processVoice, detectEmotion } = require('./featureController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/voice', authMiddleware, processVoice);
router.post('/emotion', authMiddleware, detectEmotion);

module.exports = router;
