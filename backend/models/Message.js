const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender ID is required']
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver ID is required']
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message must be less than 1000 characters']
  },
  read: {
    type: Boolean,
    default: false
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  editedAt: {
    type: Date,
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  },
  // NEW FIELDS FOR MESSAGE REQUESTS
  isRequest: {
    type: Boolean,
    default: false
  },
  requestStatus: {
    type: String,
    enum: ['pending', 'accepted', 'declined', null],
    default: null
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Indexes for efficient queries
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, read: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ senderId: 1, receiverId: 1, isRequest: 1 }); // NEW INDEX

// Virtual to get conversation participants
messageSchema.virtual('participants').get(function() {
  return [this.senderId, this.receiverId];
});

// Method to mark message as read
messageSchema.methods.markAsRead = async function() {
  this.read = true;
  this.readAt = new Date();
  return await this.save();
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = async function(userId1, userId2, limit = 50) {
  return await this.find({
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 }
    ],
    deletedAt: null,
    isRequest: false // Only get non-request messages
  })
  .populate('senderId', 'username firstName lastName profilePicture')
  .populate('receiverId', 'username firstName lastName profilePicture')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get unread count for a user
messageSchema.statics.getUnreadCount = async function(userId, fromUserId = null) {
  const query = {
    receiverId: userId,
    read: false,
    deletedAt: null,
    isRequest: false // Only count non-request messages
  };
  
  if (fromUserId) {
    query.senderId = fromUserId;
  }
  
  return await this.countDocuments(query);
};

// Static method to get last message between users
messageSchema.statics.getLastMessage = async function(userId1, userId2) {
  return await this.findOne({
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 }
    ],
    deletedAt: null,
    isRequest: false // Only get non-request messages
  })
  .populate('senderId', 'username firstName lastName')
  .sort({ createdAt: -1 });
};

// Static method to mark all messages as read
messageSchema.statics.markAllAsRead = async function(receiverId, senderId) {
  return await this.updateMany({
    senderId: senderId,
    receiverId: receiverId,
    read: false,
    deletedAt: null
  }, {
    $set: {
      read: true,
      readAt: new Date()
    }
  });
};

// NEW: Static method to check if users are friends (mutual followers)
messageSchema.statics.areUsersFriends = async function(userId1, userId2) {
  try {
    const User = require('./User');
    
    const user1 = await User.findById(userId1).populate('exploring explorers');
    if (!user1) return false;
    
    const isExploring = user1.exploring.some(u => u._id.toString() === userId2.toString());
    const isExplorer = user1.explorers.some(u => u._id.toString() === userId2.toString());
    
    return isExploring && isExplorer; // Both must be true for friendship
  } catch (error) {
    console.error('Error checking friendship:', error);
    return false;
  }
};

// NEW: Static method to get request messages
messageSchema.statics.getRequestMessages = async function(senderId, receiverId) {
  return await this.find({
    senderId,
    receiverId,
    isRequest: true,
    deletedAt: null
  })
  .populate('senderId', 'username firstName lastName profilePicture')
  .sort({ createdAt: 1 });
};

module.exports = mongoose.model('Message', messageSchema);