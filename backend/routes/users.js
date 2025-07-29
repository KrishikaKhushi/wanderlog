const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Message = require('../models/Message'); // ADD THIS LINE
const { auth } = require('../middleware/auth');

// @route   GET /api/users/all
// @desc    Get all users for social page (INCLUDING current user)
// @access  Private
router.get('/all', auth, async (req, res) => {
  try {
    console.log('👥 GET /api/users/all - Fetching all users for:', req.user?.username || 'unknown user');
    
    // Get ALL users (including current user), excluding sensitive data
    const users = await User.find(
      { isActive: true }, // REMOVED the filter that excludes current user
      {
        password: 0,
        passwordResetToken: 0,
        passwordResetExpires: 0,
        emailVerificationToken: 0
      }
    ).sort({ createdAt: -1 });
    
    console.log(`📊 Total users found (including current user): ${users.length}`);
    
    // Show actual database counts
    const usersWithStats = users.map(user => {
      const explorerCount = user.explorerCount || 0;
      const exploringCount = user.exploringCount || 0;
      
      console.log(`📊 User ${user.username}: ${explorerCount} explorers, ${exploringCount} exploring`);
      
      return {
        ...user.toJSON(),
        explorers: explorerCount,
        exploring: exploringCount
      };
    });
    
    console.log(`✅ Returning ${usersWithStats.length} users with stats (including current user)`);
    res.json({
      success: true,
      users: usersWithStats,
      total: usersWithStats.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users',
      error: error.message
    });
  }
});

// @route   GET /api/users/exploring
// @desc    Get current user's exploring list
// @access  Private
router.get('/exploring', auth, async (req, res) => {
  try {
    console.log('👥 GET /api/users/exploring - Getting exploring list for:', req.user?.username || 'unknown user');
    
    // Get current user with exploring populated
    const user = await User.findById(req.user._id)
      .populate('exploring', 'username firstName lastName profilePicture');
    
    res.json({
      success: true,
      exploring: user.exploring || []
    });
    
  } catch (error) {
    console.error('❌ Error fetching exploring:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching exploring list'
    });
  }
});

// @route   GET /api/users/explorers
// @desc    Get current user's explorers list (people who explore this user)
// @access  Private
router.get('/explorers', auth, async (req, res) => {
  try {
    console.log('👥 GET /api/users/explorers - Getting explorers list for:', req.user?.username || 'unknown user');
    
    // Get current user with explorers populated
    const user = await User.findById(req.user._id)
      .populate('explorers', 'username firstName lastName profilePicture bio createdAt');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Filter out inactive users
    const activeExplorers = user.explorers.filter(explorer => explorer.isActive !== false);
    
    console.log(`✅ Found ${activeExplorers.length} active explorers`);
    
    res.json({
      success: true,
      explorers: activeExplorers || [],
      total: activeExplorers.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching explorers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching explorers list'
    });
  }
});

// @route   GET /api/users/mutual-friends
// @desc    Get users who are mutually following each other (friends)
// @access  Private
router.get('/mutual-friends', auth, async (req, res) => {
  try {
    console.log('👥 GET /api/users/mutual-friends - Getting mutual friends for:', req.user?.username);
    
    const currentUser = await User.findById(req.user._id)
      .populate('exploring', 'username firstName lastName profilePicture explorers exploring isActive createdAt')
      .populate('explorers', 'username firstName lastName profilePicture explorers exploring isActive createdAt');
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Find mutual friends (users who are in both exploring and explorers lists)
    const mutualFriends = currentUser.exploring.filter(exploringUser => 
      currentUser.explorers.some(explorerUser => 
        explorerUser._id.toString() === exploringUser._id.toString()
      )
    ).filter(user => user.isActive);
    
    // Get last messages and unread counts for each friend
    const friendsWithMessages = await Promise.all(
      mutualFriends.map(async (friend) => {
        try {
          // Get last message between current user and friend
          const lastMessage = await Message.getLastMessage(currentUser._id, friend._id);
          
          // Get unread count from friend to current user
          const unreadCount = await Message.getUnreadCount(currentUser._id, friend._id);
          
          return {
            ...friend.toJSON(),
            lastMessage: lastMessage?.message || null,
            lastMessageTime: lastMessage?.createdAt || friend.createdAt,
            lastMessageSender: lastMessage?.senderId || null,
            unreadCount: unreadCount || 0,
            isOnline: false, // You can implement online status tracking later
            mutualSince: friend.createdAt // When they first connected
          };
        } catch (error) {
          console.error('Error getting message data for friend:', friend.username, error);
          return {
            ...friend.toJSON(),
            lastMessage: null,
            lastMessageTime: friend.createdAt,
            lastMessageSender: null,
            unreadCount: 0,
            isOnline: false,
            mutualSince: friend.createdAt
          };
        }
      })
    );
    
    // Sort by last message time (most recent first)
    friendsWithMessages.sort((a, b) => {
      const timeA = new Date(a.lastMessageTime);
      const timeB = new Date(b.lastMessageTime);
      return timeB - timeA;
    });
    
    console.log(`✅ Found ${mutualFriends.length} mutual friends`);
    
    res.json({
      success: true,
      friends: friendsWithMessages,
      total: friendsWithMessages.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching mutual friends:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching mutual friends'
    });
  }
});

// @route   POST /api/users/explore
// @desc    Explore a user
// @access  Private
router.post('/explore', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUser = req.user;
    
    console.log('👥 POST /api/users/explore - User:', currentUser.username, 'exploring:', userId);
    
    // Validate input
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Can't explore yourself
    if (userId === currentUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot explore yourself'
      });
    }
    
    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get fresh user data and explore
    const userToUpdate = await User.findById(currentUser._id);
    const result = await userToUpdate.exploreUser(userId);
    
    console.log('✅ Explore action completed');
    res.json({
      success: true,
      message: `Now exploring ${targetUser.username}`
    });
    
  } catch (error) {
    console.error('❌ Error exploring user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error exploring user'
    });
  }
});

// @route   POST /api/users/unexplore
// @desc    Stop exploring a user
// @access  Private
router.post('/unexplore', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUser = req.user;
    
    console.log('👥 POST /api/users/unexplore - User:', currentUser.username, 'stopping exploration of:', userId);
    
    // Validate input
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get fresh user data and unexplore
    const userToUpdate = await User.findById(currentUser._id);
    const result = await userToUpdate.unexploreUser(userId);
    
    console.log('✅ Unexplore action completed');
    res.json({
      success: true,
      message: `Stopped exploring ${targetUser.username}`
    });
    
  } catch (error) {
    console.error('❌ Error unexploring user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error unexploring user'
    });
  }
});

// @route   GET /api/users/:username
// @desc    Get user profile by username
// @access  Public
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    console.log('👤 GET /api/users/:username - Fetching profile for:', username);
    
    const user = await User.findOne(
      { username, isActive: true },
      {
        password: 0,
        passwordResetToken: 0,
        passwordResetExpires: 0,
        emailVerificationToken: 0
      }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Show actual database stats
    const userWithStats = {
      ...user.toJSON(),
      explorers: user.explorerCount || 0,
      exploring: user.exploringCount || 0
    };
    
    console.log('✅ User profile found');
    res.json({
      success: true,
      user: userWithStats
    });
    
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile'
    });
  }
});

// @route   GET /api/users/:username/explorers
// @desc    Get explorers list for any user by username (public)
// @access  Public
router.get('/:username/explorers', async (req, res) => {
  try {
    const { username } = req.params;
    
    console.log('👥 GET /api/users/:username/explorers - Getting explorers for:', username);
    
    const user = await User.findOne({ username, isActive: true })
      .populate('explorers', 'username firstName lastName profilePicture bio createdAt');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Filter out inactive users
    const activeExplorers = user.explorers.filter(explorer => explorer.isActive !== false);
    
    console.log(`✅ Found ${activeExplorers.length} explorers for ${username}`);
    
    res.json({
      success: true,
      explorers: activeExplorers || [],
      total: activeExplorers.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching user explorers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching explorers list'
    });
  }
});

// @route   GET /api/users/:username/exploring
// @desc    Get exploring list for any user by username (public)
// @access  Public
router.get('/:username/exploring', async (req, res) => {
  try {
    const { username } = req.params;
    
    console.log('👥 GET /api/users/:username/exploring - Getting exploring list for:', username);
    
    const user = await User.findOne({ username, isActive: true })
      .populate('exploring', 'username firstName lastName profilePicture bio createdAt');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Filter out inactive users
    const activeExploring = user.exploring.filter(exploring => exploring.isActive !== false);
    
    console.log(`✅ Found ${activeExploring.length} users that ${username} is exploring`);
    
    res.json({
      success: true,
      exploring: activeExploring || [],
      total: activeExploring.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching user exploring list:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching exploring list'
    });
  }
});

// @route   GET /api/users/search/:query
// @desc    Search users by username or name
// @access  Private
router.get('/search/:query', auth, async (req, res) => {
  try {
    const { query } = req.params;
    const currentUserId = req.user._id;
    
    console.log('🔍 GET /api/users/search - Searching for:', query);
    
    // Search users by username, firstName, or lastName
    const users = await User.find(
      {
        _id: { $ne: currentUserId },
        isActive: true,
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } }
        ]
      },
      {
        password: 0,
        passwordResetToken: 0,
        passwordResetExpires: 0,
        emailVerificationToken: 0
      }
    ).limit(20);
    
    const usersWithStats = users.map(user => ({
      ...user.toJSON(),
      explorers: user.explorerCount || 0,
      exploring: user.exploringCount || 0
    }));
    
    console.log(`✅ Found ${users.length} users matching search`);
    res.json({
      success: true,
      users: usersWithStats
    });
    
  } catch (error) {
    console.error('❌ Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching users'
    });
  }
});

module.exports = router;