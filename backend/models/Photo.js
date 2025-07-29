const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  countryCode: {
    type: String,
    required: [true, 'Country code is required'],
    trim: true,
    uppercase: true
  },
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required']
  },
  url: {
    type: String,
    required: [true, 'Photo URL is required']
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required']
  },
  caption: {
    type: String,
    maxlength: [500, 'Caption must be less than 500 characters'],
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    width: Number,
    height: Number,
    dateTaken: Date,
    location: {
      lat: Number,
      lng: Number,
      address: String
    },
    camera: {
      make: String,
      model: String,
      settings: String
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster lookups
photoSchema.index({ user: 1, country: 1 });
photoSchema.index({ user: 1, countryCode: 1 });
photoSchema.index({ user: 1, uploadedAt: -1 });
photoSchema.index({ country: 1, isPublic: 1 });
photoSchema.index({ deletedAt: 1 });

// Static method to get photos by user and country
photoSchema.statics.getByUserAndCountry = function(userId, countryCode) {
  return this.find({
    user: userId,
    countryCode: countryCode.toUpperCase(),
    deletedAt: null
  }).sort({ uploadedAt: -1 });
};

// Static method to get public photos by country
photoSchema.statics.getPublicByCountry = function(countryCode, limit = 50) {
  return this.find({
    countryCode: countryCode.toUpperCase(),
    isPublic: true,
    deletedAt: null
  })
  .populate('user', 'username firstName lastName profilePicture')
  .sort({ uploadedAt: -1 })
  .limit(limit);
};

// Instance method to toggle like
photoSchema.methods.toggleLike = async function(userId) {
  const userIndex = this.likes.indexOf(userId);
  
  if (userIndex === -1) {
    // User hasn't liked, add like
    this.likes.push(userId);
  } else {
    // User has liked, remove like
    this.likes.splice(userIndex, 1);
  }
  
  await this.save();
  return this.likes.length;
};

// Instance method to increment views
photoSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
  return this.views;
};

// Instance method to soft delete
photoSchema.methods.softDelete = async function() {
  this.deletedAt = new Date();
  await this.save();
};

// Virtual for like count
photoSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for is liked by user
photoSchema.virtual('isLikedBy').get(function() {
  return function(userId) {
    return this.likes && this.likes.includes(userId);
  };
});

// Ensure virtual fields are serialized
photoSchema.set('toJSON', { virtuals: true });
photoSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Photo', photoSchema);