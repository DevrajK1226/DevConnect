const Message = require('../models/Message');
const Room = require('../models/Room');

// @route GET /api/messages/:roomId
// @desc  Get all messages for a room
const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Confirm the user is actually a member of this room
    const room = await Room.findById(roomId);
    if (!room || !room.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this room' });
    }

    const messages = await Message.find({ room: roomId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getMessages };