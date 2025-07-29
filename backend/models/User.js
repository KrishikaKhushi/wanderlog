const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username must be less than 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name must be less than 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name must be less than 50 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio must be less than 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  // NEW: Google OAuth fields
  googleId: {
    type: String,
    default: null,
    sparse: true, // Allows multiple null values but unique non-null values
    unique: true
  },
  preferences: {
    notifications: {
      type: String,
      enum: ['all', 'important', 'none'],
      default: 'all'
    },
    language: {
      type: String,
      enum: ['english', 'hindi', 'spanish'],
      default: 'english'
    },
    privacy: {
      type: String,
      enum: ['public', 'private'],
      default: 'public'
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    }
  },
  // Social features - EXPLORING SYSTEM
  exploring: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  explorers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Password reset fields
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Email verification fields
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for faster lookups
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ googleId: 1 }); // NEW: Index for Google ID
userSchema.index({ exploring: 1 });
userSchema.index({ explorers: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // NEW: Skip hashing for Google OAuth dummy passwords
  if (this.password && this.password.startsWith('google_oauth_')) {
    return next();
  }
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('🔐 Password hashed for user:', this.username);
    next();
  } catch (error) {
    console.error('❌ Error hashing password:', error);
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // NEW: Don't allow login with dummy Google OAuth passwords
    if (this.password && this.password.startsWith('google_oauth_')) {
      return false;
    }
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('🔍 Password comparison result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('❌ Error comparing password:', error);
    throw error;
  }
};

// NEW: Check if user can login with password
userSchema.methods.canLoginWithPassword = function() {
  return !this.password.startsWith('google_oauth_');
};

// NEW: Check if user is Google OAuth user
userSchema.methods.isGoogleUser = function() {
  return !!this.googleId;
};

// Explore a user
userSchema.methods.exploreUser = async function(userIdToExplore) {
  try {
    // Don't explore if already exploring
    if (this.exploring.includes(userIdToExplore)) {
      return { success: false, message: 'Already exploring this user' };
    }
    
    // Add to exploring list
    this.exploring.push(userIdToExplore);
    await this.save();
    
    // Add to target user's explorers list
    await this.constructor.findByIdAndUpdate(
      userIdToExplore,
      { $addToSet: { explorers: this._id } }
    );
    
    console.log('✅ User', this.username, 'now exploring', userIdToExplore);
    return { success: true, message: 'Successfully exploring user' };
  } catch (error) {
    console.error('❌ Error exploring user:', error);
    throw error;
  }
};

// Stop exploring a user
userSchema.methods.unexploreUser = async function(userIdToUnexplore) {
  try {
    // Remove from exploring list
    this.exploring = this.exploring.filter(id => !id.equals(userIdToUnexplore));
    await this.save();
    
    // Remove from target user's explorers list
    await this.constructor.findByIdAndUpdate(
      userIdToUnexplore,
      { $pull: { explorers: this._id } }
    );
    
    console.log('✅ User', this.username, 'stopped exploring', userIdToUnexplore);
    return { success: true, message: 'Successfully stopped exploring user' };
  } catch (error) {
    console.error('❌ Error stopping exploration:', error);
    throw error;
  }
};

// Get user info without password
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.emailVerificationToken;
  return userObject;
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Virtual for explorer count
userSchema.virtual('explorerCount').get(function() {
  return this.explorers ? this.explorers.length : 0;
});

// Virtual for exploring count
userSchema.virtual('exploringCount').get(function() {
  return this.exploring ? this.exploring.length : 0;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  
  this.passwordResetToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Generate email verification token
userSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = require('crypto').randomBytes(32).toString('hex');
  
  this.emailVerificationToken = require('crypto')
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  return verificationToken;
};

module.exports = mongoose.model('User', userSchema);