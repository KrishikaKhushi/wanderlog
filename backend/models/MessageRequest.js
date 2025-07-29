const mongoose = require('mongoose');

const messageRequestSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  firstMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  messageCount: {
    type: Number,
    default: 0
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate requests
messageRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

// Index for finding requests by receiver
messageRequestSchema.index({ receiverId: 1, status: 1 });

// Static method to get requests with sender details
messageRequestSchema.statics.getRequestsForUser = async function(receiverId) {
  return this.aggregate([
    {
      $match: {
        receiverId: new mongoose.Types.ObjectId(receiverId),
        status: 'pending'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'senderId',
        foreignField: '_id',
        as: 'senderDetails'
      }
    },
    {
      $unwind: '$senderDetails'
    },
    {
      $match: {
        'senderDetails.isActive': true
      }
    },
    {
      $project: {
        _id: 1,
        senderId: 1,
        senderUsername: '$senderDetails.username',
        senderFirstName: '$senderDetails.firstName',
        senderLastName: '$senderDetails.lastName',
        senderProfilePicture: '$senderDetails.profilePicture',
        lastMessage: 1,
        messageCount: 1,
        timestamp: '$lastMessageTime',
        isOnline: { $literal: false } // FIX: Use $literal instead of direct assignment
      }
    },
    {
      $sort: { timestamp: -1 }
    }
  ]);
};

module.exports = mongoose.model('MessageRequest', messageRequestSchema);