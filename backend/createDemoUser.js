// createDemoUser.js - Run this once to create a demo user
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import your User model
const User = require('./models/User');

const createDemoUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if demo user already exists
    const existingUser = await User.findOne({ email: 'demo@wanderbook.com' });
    if (existingUser) {
      console.log('✅ Demo user already exists');
      process.exit(0);
    }

    // Create demo user
    const demoUser = new User({
      username: 'demouser',
      email: 'demo@wanderbook.com',
      password: 'demo123',
      firstName: 'Demo',
      lastName: 'User',
      isActive: true
    });

    await demoUser.save();
    console.log('✅ Demo user created successfully!');
    console.log('📧 Email: demo@wanderbook.com');
    console.log('🔑 Password: demo123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
    process.exit(1);
  }
};

createDemoUser();