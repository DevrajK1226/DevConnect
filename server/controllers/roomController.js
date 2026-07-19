const Room = require('../models/Room');
const User = require('../models/User');
const Message = require('../models/Message');

// @route POST /api/rooms
// @desc  Create a 1-on-1 room OR a group room
const createRoom = async (req, res) => {
  try {
    const { memberId, isGroup, name, members } = req.body;
    const userId = req.user._id;

    if (isGroup) {
      if (!name || !members || members.length < 2) {
        return res.status(400).json({ message: 'Group needs a name and at least 2 other members' });
      }
      const room = await Room.create({
        name,
        isGroup: true,
        members: [userId, ...members],
        createdBy: userId
      });
      const populatedRoom = await room.populate('members', 'name email isOnline lastSeen');
      return res.status(201).json(populatedRoom);
    }

    // 1-on-1 chat
    if (!memberId) {
      return res.status(400).json({ message: 'memberId is required for 1-on-1 chat' });
    }

    // Check if a 1-on-1 room already exists between these two users
    const existingRoom = await Room.findOne({
      isGroup: false,
      members: { $all: [userId, memberId], $size: 2 }
    }).populate('members', 'name email isOnline lastSeen');

    if (existingRoom) {
      return res.status(200).json(existingRoom);
    }

    const room = await Room.create({
      isGroup: false,
      members: [userId, memberId]
    });
    const populatedRoom = await room.populate('members', 'name email isOnline lastSeen');

    res.status(201).json(populatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route GET /api/rooms
// @desc  Get all rooms the logged-in user belongs to
const getUserRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id })
      .populate('members', 'name email isOnline lastSeen')
      .sort({ updatedAt: -1 });

    // For each room, count messages not yet read by this user
    const roomsWithUnread = await Promise.all(
      rooms.map(async (room) => {
        const unreadCount = await Message.countDocuments({
          room: room._id,
          readBy: { $ne: req.user._id }
        });
        return { ...room.toObject(), unreadCount };
      })
    );

    res.status(200).json(roomsWithUnread);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route GET /api/rooms/users
// @desc  Get all users except the logged-in user (to start a new chat)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('name email isOnline lastSeen');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createRoom, getUserRooms, getAllUsers };