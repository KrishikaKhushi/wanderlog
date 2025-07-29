const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
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
    maxlength: [200, 'Title must be less than 200 characters'],
    default: ''
  },
  content: {
    type: String,
    required: [true, 'Journal content is required'],
    trim: true,
    maxlength: [5000, 'Journal entry must be less than 5000 characters']
  },
  mood: {
    type: String,
    enum: ['excited', 'happy', 'content', 'thoughtful', 'sad', 'frustrated', 'amazed', 'grateful'],
    default: 'content'
  },
  weather: {
    type: String,
    enum: ['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'stormy', 'foggy'],
    default: null
  },
  location: {
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    address: String
  },
  visitDate: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  photos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo'
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  isFavorite: {
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
  wordCount: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number, // in minutes
    default: 0
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster lookups
journalEntrySchema.index({ user: 1, country: 1 });
journalEntrySchema.index({ user: 1, countryCode: 1 });
journalEntrySchema.index({ user: 1, createdAt: -1 });
journalEntrySchema.index({ country: 1, isPublic: 1 });
journalEntrySchema.index({ tags: 1 });
journalEntrySchema.index({ deletedAt: 1 });
journalEntrySchema.index({ visitDate: 1 });

// Pre-save middleware to calculate word count and reading time
journalEntrySchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Calculate word count
    const words = this.content.trim().split(/\s+/).filter(word => word.length > 0);
    this.wordCount = words.length;
    
    // Calculate reading time (average 200 words per minute)
    this.readingTime = Math.ceil(this.wordCount / 200);
  }
  next();
});

// Static method to get entries by user and country
journalEntrySchema.statics.getByUserAndCountry = function(userId, countryCode) {
  return this.find({
    user: userId,
    countryCode: countryCode.toUpperCase(),
    deletedAt: null
  }).sort({ createdAt: -1 });
};

// Static method to get public entries by country
journalEntrySchema.statics.getPublicByCountry = function(countryCode, limit = 20) {
  return this.find({
    countryCode: countryCode.toUpperCase(),
    isPublic: true,
    deletedAt: null
  })
  .populate('user', 'username firstName lastName profilePicture')
  .populate('photos', 'url thumbnailUrl caption')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get user's journal statistics
journalEntrySchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    {
      $match: {
        user: userId,
        deletedAt: null
      }
    },
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        totalWords: { $sum: '$wordCount' },
        avgWordsPerEntry: { $avg: '$wordCount' },
        totalReadingTime: { $sum: '$readingTime' },
        countriesVisited: { $addToSet: '$countryCode' },
        favoritesCount: {
          $sum: {
            $cond: [{ $eq: ['$isFavorite', true] }, 1, 0]
          }
        },
        publicCount: {
          $sum: {
            $cond: [{ $eq: ['$isPublic', true] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalEntries: 1,
        totalWords: 1,
        avgWordsPerEntry: { $round: ['$avgWordsPerEntry', 0] },
        totalReadingTime: 1,
        countriesCount: { $size: '$countriesVisited' },
        countries: '$countriesVisited',
        favoritesCount: 1,
        publicCount: 1
      }
    }
  ]);
};

// Instance method to toggle like
journalEntrySchema.methods.toggleLike = async function(userId) {
  const userIndex = this.likes.indexOf(userId);
  
  if (userIndex === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(userIndex, 1);
  }
  
  await this.save();
  return this.likes.length;
};

// Instance method to add comment
journalEntrySchema.methods.addComment = async function(userId, text) {
  this.comments.push({
    user: userId,
    text: text.trim()
  });
  
  await this.save();
  
  // Populate the new comment
  await this.populate('comments.user', 'username firstName lastName profilePicture');
  
  return this.comments[this.comments.length - 1];
};

// Instance method to increment views
journalEntrySchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
  return this.views;
};

// Instance method to soft delete
journalEntrySchema.methods.softDelete = async function() {
  this.deletedAt = new Date();
  await this.save();
};

// Virtual for like count
journalEntrySchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
journalEntrySchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Virtual for excerpt (first 150 characters)
journalEntrySchema.virtual('excerpt').get(function() {
  if (!this.content) return '';
  
  const plainText = this.content.replace(/[#*_`]/g, ''); // Remove basic markdown
  return plainText.length > 150 
    ? plainText.substring(0, 150) + '...'
    : plainText;
});

// Virtual for formatted date
journalEntrySchema.virtual('formattedDate').get(function() {
  const date = this.visitDate || this.createdAt;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Ensure virtual fields are serialized
journalEntrySchema.set('toJSON', { virtuals: true });
journalEntrySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);