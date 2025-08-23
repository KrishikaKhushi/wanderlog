// models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
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
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title must be less than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description must be less than 1000 characters']
  },
  photos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo',
    required: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: [500, 'Comment must be less than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
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
postSchema.index({ user: 1, country: 1 });
postSchema.index({ user: 1, countryCode: 1 });
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ country: 1, isPublic: 1 });
postSchema.index({ deletedAt: 1 });

// Static method to get posts by user and country
postSchema.statics.getByUserAndCountry = function(userId, countryCode) {
  return this.find({
    user: userId,
    countryCode: countryCode.toUpperCase(),
    deletedAt: null
  })
  .populate('photos')
  .populate('user', 'username firstName lastName profilePicture')
  .sort({ createdAt: -1 });
};

// Static method to get public posts by country
postSchema.statics.getPublicByCountry = function(countryCode, limit = 20) {
  return this.find({
    countryCode: countryCode.toUpperCase(),
    isPublic: true,
    deletedAt: null
  })
  .populate('photos')
  .populate('user', 'username firstName lastName profilePicture')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Instance method to toggle like
postSchema.methods.toggleLike = async function(userId) {
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

// Instance method to add comment
postSchema.methods.addComment = async function(userId, text) {
  this.comments.push({
    user: userId,
    text: text.trim()
  });
  
  await this.save();
  return this.comments[this.comments.length - 1];
};

// Instance method to increment views
postSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
  return this.views;
};

// Instance method to soft delete
postSchema.methods.softDelete = async function() {
  this.deletedAt = new Date();
  await this.save();
};

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Virtual for photo count
postSchema.virtual('photoCount').get(function() {
  return this.photos ? this.photos.length : 0;
});

// Ensure virtual fields are serialized
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);