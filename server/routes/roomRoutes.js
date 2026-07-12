const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createRoom, getUserRooms, getAllUsers } = require('../controllers/roomController');

router.use(protect); // all routes below require login

router.post('/', createRoom);
router.get('/', getUserRooms);
router.get('/users', getAllUsers);

module.exports = router;