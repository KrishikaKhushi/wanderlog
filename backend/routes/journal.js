const express = require('express');
const router = express.Router();
const JournalEntry = require('../models/JournalEntry');
const { auth } = require('../middleware/auth');

// @route   GET /api/journal/country/:countryCode
// @desc    Get all journal entries for a country by the authenticated user
// @access  Private
router.get('/country/:countryCode', auth, async (req, res) => {
  try {
    const { countryCode } = req.params;
    const userId = req.user._id;
    
    console.log('📖 GET /api/journal/country/:countryCode - Getting entries for:', countryCode, 'user:', req.user.username);
    
    const entries = await JournalEntry.getByUserAndCountry(userId, countryCode)
      .populate('photos', 'url thumbnailUrl caption');
    
    console.log(`✅ Found ${entries.length} journal entries for ${countryCode}`);
    
    res.json({
      success: true,
      entries: entries,
      total: entries.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching journal entries:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching journal entries'
    });
  }
});

// @route   GET /api/journal/country/:countryCode/public
// @desc    Get public journal entries for a country
// @access  Public
router.get('/country/:countryCode/public', async (req, res) => {
  try {
    const { countryCode } = req.params;
    const { limit = 20 } = req.query;
    
    console.log('🌍 GET /api/journal/country/:countryCode/public - Getting public entries for:', countryCode);
    
    const entries = await JournalEntry.getPublicByCountry(countryCode, parseInt(limit));
    
    console.log(`✅ Found ${entries.length} public journal entries for ${countryCode}`);
    
    res.json({
      success: true,
      entries: entries,
      total: entries.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching public journal entries:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching public journal entries'
    });
  }
});

// @route   POST /api/journal
// @desc    Create a new journal entry
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      country,
      countryCode,
      title,
      content,
      mood,
      weather,
      location,
      visitDate,
      tags,
      photos,
      isPublic,
      isFavorite
    } = req.body;
    
    const userId = req.user._id;
    
    console.log('📖 POST /api/journal - Creating entry for:', country, 'user:', req.user.username);
    
    // Validation
    if (!country || !countryCode || !content) {
      return res.status(400).json({
        success: false,
        message: 'Country, country code, and content are required'
      });
    }
    
    // Create new journal entry
    const entry = new JournalEntry({
      user: userId,
      country: country.trim(),
      countryCode: countryCode.trim().toUpperCase(),
      title: title || '',
      content: content.trim(),
      mood: mood || 'content',
      weather: weather || null,
      location: location || null,
      visitDate: visitDate || null,
      tags: tags || [],
      photos: photos || [],
      isPublic: isPublic || false,
      isFavorite: isFavorite || false
    });
    
    const savedEntry = await entry.save();
    
    // Populate related data
    await savedEntry.populate('photos', 'url thumbnailUrl caption');
    
    console.log('✅ Journal entry created successfully');
    
    res.status(201).json({
      success: true,
      message: 'Journal entry created successfully',
      entry: savedEntry
    });
    
  } catch (error) {
    console.error('❌ Error creating journal entry:', error);
    
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
      message: 'Server error creating journal entry'
    });
  }
});

// @route   GET /api/journal/:entryId
// @desc    Get a specific journal entry
// @access  Private
router.get('/:entryId', auth, async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user._id;
    
    console.log('📖 GET /api/journal/:entryId - Getting entry:', entryId);
    
    const entry = await JournalEntry.findOne({
      _id: entryId,
      user: userId,
      deletedAt: null
    }).populate('photos', 'url thumbnailUrl caption');
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }
    
    console.log('✅ Journal entry found');
    
    res.json({
      success: true,
      entry: entry
    });
    
  } catch (error) {
    console.error('❌ Error fetching journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching journal entry'
    });
  }
});

// @route   PUT /api/journal/:entryId
// @desc    Update a journal entry
// @access  Private
router.put('/:entryId', auth, async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user._id;
    const {
      title,
      content,
      mood,
      weather,
      location,
      visitDate,
      tags,
      photos,
      isPublic,
      isFavorite
    } = req.body;
    
    console.log('📝 PUT /api/journal/:entryId - Updating entry:', entryId);
    
    const entry = await JournalEntry.findOne({
      _id: entryId,
      user: userId,
      deletedAt: null
    });
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found or you do not have permission to update it'
      });
    }
    
    // Update fields
    if (title !== undefined) entry.title = title;
    if (content !== undefined) entry.content = content.trim();
    if (mood !== undefined) entry.mood = mood;
    if (weather !== undefined) entry.weather = weather;
    if (location !== undefined) entry.location = location;
    if (visitDate !== undefined) entry.visitDate = visitDate;
    if (tags !== undefined) entry.tags = tags;
    if (photos !== undefined) entry.photos = photos;
    if (isPublic !== undefined) entry.isPublic = isPublic;
    if (isFavorite !== undefined) entry.isFavorite = isFavorite;
    
    const updatedEntry = await entry.save();
    
    // Populate related data
    await updatedEntry.populate('photos', 'url thumbnailUrl caption');
    
    console.log('✅ Journal entry updated successfully');
    
    res.json({
      success: true,
      message: 'Journal entry updated successfully',
      entry: updatedEntry
    });
    
  } catch (error) {
    console.error('❌ Error updating journal entry:', error);
    
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
      message: 'Server error updating journal entry'
    });
  }
});

// @route   DELETE /api/journal/:entryId
// @desc    Delete a journal entry (soft delete)
// @access  Private
router.delete('/:entryId', auth, async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user._id;
    
    console.log('🗑️ DELETE /api/journal/:entryId - Deleting entry:', entryId);
    
    const entry = await JournalEntry.findOne({
      _id: entryId,
      user: userId,
      deletedAt: null
    });
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found or you do not have permission to delete it'
      });
    }
    
    await entry.softDelete();
    
    console.log('✅ Journal entry deleted successfully');
    
    res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting journal entry'
    });
  }
});

// @route   POST /api/journal/:entryId/like
// @desc    Toggle like on a journal entry
// @access  Private
router.post('/:entryId/like', auth, async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user._id;
    
    console.log('❤️ POST /api/journal/:entryId/like - Toggling like for entry:', entryId);
    
    const entry = await JournalEntry.findById(entryId);
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }
    
    const likeCount = await entry.toggleLike(userId);
    
    console.log('✅ Like toggled successfully');
    
    res.json({
      success: true,
      message: 'Like toggled successfully',
      likeCount: likeCount,
      isLiked: entry.likes.includes(userId)
    });
    
  } catch (error) {
    console.error('❌ Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling like'
    });
  }
});

// @route   POST /api/journal/:entryId/comment
// @desc    Add a comment to a journal entry
// @access  Private
router.post('/:entryId/comment', auth, async (req, res) => {
  try {
    const { entryId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;
    
    console.log('💬 POST /api/journal/:entryId/comment - Adding comment to entry:', entryId);
    
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }
    
    const entry = await JournalEntry.findById(entryId);
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }
    
    const comment = await entry.addComment(userId, text);
    
    console.log('✅ Comment added successfully');
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: comment
    });
    
  } catch (error) {
    console.error('❌ Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding comment'
    });
  }
});

// @route   GET /api/journal/user/stats
// @desc    Get user's journal statistics
// @access  Private
router.get('/user/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log('📊 GET /api/journal/user/stats - Getting journal stats for:', req.user.username);
    
    const stats = await JournalEntry.getUserStats(userId);
    
    const result = stats[0] || {
      totalEntries: 0,
      totalWords: 0,
      avgWordsPerEntry: 0,
      totalReadingTime: 0,
      countriesCount: 0,
      countries: [],
      favoritesCount: 0,
      publicCount: 0
    };
    
    console.log('✅ Journal stats calculated successfully');
    
    res.json({
      success: true,
      stats: result
    });
    
  } catch (error) {
    console.error('❌ Error getting journal stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting journal statistics'
    });
  }
});

// @route   GET /api/journal/search
// @desc    Search journal entries by content, title, or tags
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q, country, tags, mood, limit = 20, page = 1 } = req.query;
    const userId = req.user._id;
    
    console.log('🔍 GET /api/journal/search - Searching entries for:', q);
    
    // Build search query
    const searchQuery = {
      user: userId,
      deletedAt: null
    };
    
    // Text search
    if (q) {
      searchQuery.$or = [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }
    
    // Filter by country
    if (country) {
      searchQuery.countryCode = country.toUpperCase();
    }
    
    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      searchQuery.tags = { $in: tagArray };
    }
    
    // Filter by mood
    if (mood) {
      searchQuery.mood = mood;
    }
    
    const entries = await JournalEntry.find(searchQuery)
      .populate('photos', 'url thumbnailUrl caption')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await JournalEntry.countDocuments(searchQuery);
    
    console.log(`✅ Found ${entries.length} entries matching search`);
    
    res.json({
      success: true,
      entries: entries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('❌ Error searching journal entries:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching journal entries'
    });
  }
});

module.exports = router;