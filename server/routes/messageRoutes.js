const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMessages, searchMessages } = require('../controllers/messageController');


router.use(protect);
router.get('/:roomId/search', searchMessages);
router.get('/:roomId', getMessages);

module.exports = router;