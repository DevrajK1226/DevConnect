const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMessages } = require('../controllers/messageController');

router.use(protect);

router.get('/:roomId', getMessages);

module.exports = router;