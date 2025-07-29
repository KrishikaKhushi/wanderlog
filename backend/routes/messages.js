const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const MessageRequest = require('../models/MessageRequest');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// @route   GET /api/messages/conversations
// @desc    Get all conversations for current user with last message
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    console.log('💬 GET /api/messages/conversations - Getting conversations for:', req.user?.username);
    
    const currentUserId = req.user._id;
    
    // Get all messages where user is sender or receiver
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: currentUserId },
            { receiverId: currentUserId }
          ],
          deletedAt: null
        }
      },
      {
        $addFields: {
          otherUserId: {
            $cond: {
              if: { $eq: ['$senderId', currentUserId] },
              then: '$receiverId',
              else: '$senderId'
            }
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$otherUserId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ['$receiverId', currentUserId] },
                    { $eq: ['$read', false] }
                  ]
                },
                then: 1,
                else: 0
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $match: {
          'userDetails.isActive': true
        }
      },
      {
        $project: {
          user: {
            _id: '$userDetails._id',
            username: '$userDetails.username',
            firstName: '$userDetails.firstName',
            lastName: '$userDetails.lastName',
            profilePicture: '$userDetails.profilePicture'
          },
          lastMessage: '$lastMessage.message',
          lastMessageTime: '$lastMessage.createdAt',
          lastMessageSender: '$lastMessage.senderId',
          unreadCount: 1
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);
    
    console.log(`✅ Found ${messages.length} conversations`);
    
    res.json({
      success: true,
      conversations: messages
    });
    
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching conversations'
    });
  }
});

// MESSAGE REQUEST ROUTES (MUST COME BEFORE /:userId ROUTE)

// @route   GET /api/messages/requests
// @desc    Get all pending message requests for current user
// @access  Private
router.get('/requests', auth, async (req, res) => {
  try {
    console.log('📨 GET /api/messages/requests - Getting requests for:', req.user?.username);
    
    const currentUserId = req.user._id;
    
    // Get pending requests with sender details
    const requests = await MessageRequest.getRequestsForUser(currentUserId);
    
    console.log(`✅ Found ${requests.length} pending message requests`);
    
    res.json({
      success: true,
      requests: requests
    });
    
  } catch (error) {
    console.error('❌ Error fetching message requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching message requests'
    });
  }
});

// @route   GET /api/messages/requests/count
// @desc    Get count of pending message requests
// @access  Private
router.get('/requests/count', auth, async (req, res) => {
  try {
    console.log('📨 GET /api/messages/requests/count - Getting count for:', req.user?.username);
    
    const currentUserId = req.user._id;
    
    const count = await MessageRequest.countDocuments({
      receiverId: currentUserId,
      status: 'pending'
    });
    
    console.log(`✅ Found ${count} pending requests`);
    
    res.json({
      success: true,
      count: count
    });
    
  } catch (error) {
    console.error('❌ Error fetching requests count:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching requests count'
    });
  }
});

// @route   GET /api/messages/requests/:senderId
// @desc    Get messages for a specific request
// @access  Private
router.get('/requests/:senderId', auth, async (req, res) => {
  try {
    const { senderId } = req.params;
    const currentUserId = req.user._id;
    
    console.log('📨 GET /api/messages/requests/:senderId - Getting request messages from:', senderId);
    
    // Verify the request exists
    const request = await MessageRequest.findOne({
      senderId: senderId,
      receiverId: currentUserId,
      status: 'pending'
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Message request not found'
      });
    }
    
    // Get request messages
    const messages = await Message.getRequestMessages(senderId, currentUserId);
    
    console.log(`✅ Found ${messages.length} request messages`);
    
    res.json({
      success: true,
      messages: messages
    });
    
  } catch (error) {
    console.error('❌ Error fetching request messages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching request messages'
    });
  }
});

// @route   POST /api/messages/requests/:senderId/accept
// @desc    Accept a message request
// @access  Private
router.post('/requests/:senderId/accept', auth, async (req, res) => {
  try {
    const { senderId } = req.params;
    const currentUserId = req.user._id;
    
    console.log('✅ POST /api/messages/requests/:senderId/accept - Accepting request from:', senderId);
    
    // Find the request
    const request = await MessageRequest.findOne({
      senderId: senderId,
      receiverId: currentUserId,
      status: 'pending'
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Message request not found'
      });
    }
    
    // Update request status
    request.status = 'accepted';
    await request.save();
    
    // Update all request messages to normal messages
    await Message.updateMany(
      {
        senderId: senderId,
        receiverId: currentUserId,
        isRequest: true
      },
      {
        $set: {
          isRequest: false,
          requestStatus: 'accepted'
        }
      }
    );
    
    console.log('✅ Message request accepted successfully');
    
    res.json({
      success: true,
      message: 'Message request accepted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error accepting message request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error accepting message request'
    });
  }
});

// @route   POST /api/messages/requests/:senderId/decline
// @desc    Decline a message request
// @access  Private
router.post('/requests/:senderId/decline', auth, async (req, res) => {
  try {
    const { senderId } = req.params;
    const currentUserId = req.user._id;
    
    console.log('❌ POST /api/messages/requests/:senderId/decline - Declining request from:', senderId);
    
    // Find the request
    const request = await MessageRequest.findOne({
      senderId: senderId,
      receiverId: currentUserId,
      status: 'pending'
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Message request not found'
      });
    }
    
    // Update request status
    request.status = 'declined';
    await request.save();
    
    // Soft delete all request messages
    await Message.updateMany(
      {
        senderId: senderId,
        receiverId: currentUserId,
        isRequest: true
      },
      {
        $set: {
          deletedAt: new Date(),
          requestStatus: 'declined'
        }
      }
    );
    
    console.log('❌ Message request declined successfully');
    
    res.json({
      success: true,
      message: 'Message request declined successfully'
    });
    
  } catch (error) {
    console.error('❌ Error declining message request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error declining message request'
    });
  }
});

// @route   GET /api/messages/unread/count
// @desc    Get total unread message count for current user
// @access  Private
router.get('/unread/count', auth, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    console.log('📊 GET /api/messages/unread/count - Getting unread count for:', req.user?.username);
    
    const unreadCount = await Message.getUnreadCount(currentUserId);
    
    res.json({
      success: true,
      unreadCount
    });
    
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting unread count'
    });
  }
});

// @route   GET /api/messages/:userId (THIS MUST COME AFTER ALL SPECIFIC ROUTES)
// @desc    Get messages between current user and another user
// @access  Private
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    const { page = 1, limit = 50 } = req.query;
    
    console.log('💬 GET /api/messages/:userId - Getting messages between:', currentUserId, 'and', userId);
    
    // Validate that the other user exists and is active
    const otherUser = await User.findById(userId);
    if (!otherUser || !otherUser.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get messages with pagination
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId }
      ],
      deletedAt: null
    })
    .populate('senderId', 'username firstName lastName profilePicture')
    .populate('receiverId', 'username firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    // Reverse to show oldest first
    messages.reverse();
    
    // Mark messages from other user as read
    await Message.markAllAsRead(currentUserId, userId);
    
    console.log(`✅ Found ${messages.length} messages`);
    
    res.json({
      success: true,
      messages: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Message.countDocuments({
          $or: [
            { senderId: currentUserId, receiverId: userId },
            { senderId: userId, receiverId: currentUserId }
          ],
          deletedAt: null
        })
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching messages'
    });
  }
});

// @route   POST /api/messages/send
// @desc    Send a message to another user (UPDATED WITH REQUEST LOGIC)
// @access  Private
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, message, messageType = 'text' } = req.body;
    const senderId = req.user._id;
    
    console.log('💬 POST /api/messages/send - Sending message from:', senderId, 'to:', receiverId);
    
    // Validate input
    if (!receiverId || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and message content are required'
      });
    }
    
    // Validate receiver exists and is active
    const receiver = await User.findById(receiverId);
    if (!receiver || !receiver.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }
    
    // Can't send message to yourself
    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself'
      });
    }
    
    // Check if users are friends (mutual followers)
    const areFriends = await Message.areUsersFriends(senderId, receiverId);
    
    let isRequestMessage = false;
    let messageRequest = null;
    
    if (!areFriends) {
      // Check if there's already a pending request
      messageRequest = await MessageRequest.findOne({
        senderId: senderId,
        receiverId: receiverId
      });
      
      if (!messageRequest) {
        // Create new message request
        messageRequest = new MessageRequest({
          senderId: senderId,
          receiverId: receiverId,
          status: 'pending',
          lastMessage: message.trim(),
          lastMessageTime: new Date(),
          messageCount: 1
        });
        await messageRequest.save();
        isRequestMessage = true;
      } else if (messageRequest.status === 'pending') {
        // Update existing request
        messageRequest.lastMessage = message.trim();
        messageRequest.lastMessageTime = new Date();
        messageRequest.messageCount += 1;
        await messageRequest.save();
        isRequestMessage = true;
      } else if (messageRequest.status === 'declined') {
        return res.status(403).json({
          success: false,
          message: 'Your message request was declined'
        });
      }
      // If status is 'accepted', treat as normal message
    }
    
    // Create new message
    const newMessage = new Message({
      senderId,
      receiverId,
      message: message.trim(),
      messageType,
      read: false,
      isRequest: isRequestMessage,
      requestStatus: isRequestMessage ? 'pending' : null
    });
    
    await newMessage.save();
    
    // Update message request with first/last message IDs
    if (messageRequest && isRequestMessage) {
      if (!messageRequest.firstMessageId) {
        messageRequest.firstMessageId = newMessage._id;
      }
      messageRequest.lastMessageId = newMessage._id;
      await messageRequest.save();
    }
    
    // Populate sender and receiver info
    await newMessage.populate('senderId', 'username firstName lastName profilePicture');
    await newMessage.populate('receiverId', 'username firstName lastName profilePicture');
    
    console.log('✅ Message sent successfully', isRequestMessage ? '(as request)' : '(normal)');
    
    res.status(201).json({
      success: true,
      message: isRequestMessage ? 'Message request sent successfully' : 'Message sent successfully',
      data: newMessage,
      isRequest: isRequestMessage
    });
    
  } catch (error) {
    console.error('❌ Error sending message:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error sending message'
    });
  }
});

// @route   PUT /api/messages/mark-read/:userId
// @desc    Mark all messages from a user as read
// @access  Private
router.put('/mark-read/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    
    console.log('✅ PUT /api/messages/mark-read - Marking messages as read from:', userId, 'to:', currentUserId);
    
    // Validate that the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Mark all unread messages from this user as read
    const result = await Message.markAllAsRead(currentUserId, userId);
    
    console.log(`✅ Marked ${result.modifiedCount} messages as read`);
    
    res.json({
      success: true,
      message: 'Messages marked as read',
      updatedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error('❌ Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking messages as read'
    });
  }
});

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message (soft delete)
// @access  Private
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user._id;
    
    console.log('🗑️ DELETE /api/messages/:messageId - Deleting message:', messageId);
    
    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Only sender can delete their message
    if (message.senderId.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }
    
    // Soft delete - set deletedAt timestamp
    message.deletedAt = new Date();
    await message.save();
    
    console.log('✅ Message deleted successfully');
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting message'
    });
  }
});

module.exports = router;