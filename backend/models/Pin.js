const mongoose = require('mongoose');

const pinSchema = new mongoose.Schema({
  lat: { 
    type: Number, 
    required: [true, 'Latitude is required'],
    min: [-90, 'Latitude must be at least -90'],
    max: [90, 'Latitude must be at most 90']
  },
  lng: { 
    type: Number, 
    required: [true, 'Longitude is required'],
    min: [-180, 'Longitude must be at least -180'],
    max: [180, 'Longitude must be at most 180']
  },
  country: { 
    type: String, 
    required: [true, 'Country is required'],
    trim: true,
    maxlength: [100, 'Country name too long']
  },
  type: { 
    type: String, 
    enum: {
      values: ['visited', 'dream'],
      message: 'Type must be either "visited" or "dream"'
    },
    default: 'visited' 
  },
  // NEW: Reference to the user who created this pin
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  // NEW: Optional pin details
  notes: {
    type: String,
    maxlength: [1000, 'Notes must be less than 1000 characters']
  },
  visitDate: {
    type: Date,
    default: null
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must be at most 5'],
    default: null
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create compound index to ensure one pin per country per user
pinSchema.index({ user: 1, country: 1 }, { unique: true });

// Index for faster user-based queries
pinSchema.index({ user: 1 });
pinSchema.index({ type: 1 });
pinSchema.index({ isPublic: 1 });

// Add logging middleware
pinSchema.pre('save', function(next) {
  console.log('💾 About to save pin for user:', this.user, 'country:', this.country);
  next();
});

pinSchema.post('save', function(doc) {
  console.log('✅ Pin saved to database:', {
    country: doc.country,
    type: doc.type,
    user: doc.user
  });
});

// Handle duplicate key errors
pinSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    console.log('🔄 Duplicate pin - user already has pin for this country');
    next(new Error('You already have a pin for this country'));
  } else {
    next(error);
  }
});

// Virtual to populate user info
pinSchema.virtual('userInfo', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
pinSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Pin', pinSchema);