const express = require('express');
const router = express.Router();
const Pin = require('../models/Pin');
const { auth, optionalAuth } = require('../middleware/auth');

// @route   GET /api/pins
// @desc    Get all pins for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    console.log('📍 GET /api/pins - Fetching pins for user:', req.user.username);
    
    // Get only the current user's pins
    const pins = await Pin.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    console.log(`✅ Found ${pins.length} pins for user:`, req.user.username);
    res.json(pins);
  } catch (err) {
    console.error('❌ Error fetching pins:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching pins',
      error: err.message 
    });
  }
});

// @route   GET /api/pins/public
// @desc    Get all public pins (for explore feature)
// @access  Public
router.get('/public', optionalAuth, async (req, res) => {
  try {
    console.log('🌍 GET /api/pins/public - Fetching public pins');
    
    // Get public pins with user info
    const pins = await Pin.find({ isPublic: true })
      .populate('user', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .limit(100); // Limit for performance
    
    console.log(`✅ Found ${pins.length} public pins`);
    res.json(pins);
  } catch (err) {
    console.error('❌ Error fetching public pins:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching public pins',
      error: err.message 
    });
  }
});

// @route   POST /api/pins
// @desc    Create a new pin
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { lat, lng, country, type, notes, visitDate, rating, isPublic } = req.body;
    
    console.log('📍 POST /api/pins - Creating pin for user:', req.user.username);
    console.log('📍 Pin data:', { lat, lng, country, type });
    
    // Validation
    if (!lat || !lng || !country) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: lat, lng, country'
      });
    }

    // Validate coordinates
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.error('❌ Invalid coordinates');
      return res.status(400).json({ 
        success: false,
        message: 'Invalid coordinates'
      });
    }

    // Check if user already has a pin for this country
    const existingPin = await Pin.findOne({ 
      user: req.user._id, 
      country: country.trim() 
    });

    if (existingPin) {
      console.log('🔄 Updating existing pin for country:', country);
      
      // Update existing pin
      existingPin.lat = parseFloat(lat);
      existingPin.lng = parseFloat(lng);
      existingPin.type = type || 'visited';
      existingPin.notes = notes || existingPin.notes;
      existingPin.visitDate = visitDate || existingPin.visitDate;
      existingPin.rating = rating || existingPin.rating;
      existingPin.isPublic = isPublic !== undefined ? isPublic : existingPin.isPublic;
      
      const updatedPin = await existingPin.save();
      console.log('✅ Pin updated successfully');
      
      return res.json({
        success: true,
        message: 'Pin updated successfully',
        pin: updatedPin
      });
    }

    // Create new pin
    const newPin = new Pin({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      country: country.trim(),
      type: type || 'visited',
      user: req.user._id,
      notes: notes || '',
      visitDate: visitDate || null,
      rating: rating || null,
      isPublic: isPublic || false
    });
    
    const savedPin = await newPin.save();
    console.log('✅ New pin created successfully');
    
    res.status(201).json({
      success: true,
      message: 'Pin created successfully',
      pin: savedPin
    });
    
  } catch (err) {
    console.error('❌ Error creating pin:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error creating pin',
      error: err.message 
    });
  }
});

// @route   PUT /api/pins/:id
// @desc    Update a pin
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { lat, lng, country, type, notes, visitDate, rating, isPublic } = req.body;
    
    console.log('📝 PUT /api/pins/:id - Updating pin:', req.params.id);
    
    // Find pin and ensure it belongs to the user
    const pin = await Pin.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!pin) {
      return res.status(404).json({
        success: false,
        message: 'Pin not found or you do not have permission to update it'
      });
    }
    
    // Update fields
    if (lat !== undefined) pin.lat = parseFloat(lat);
    if (lng !== undefined) pin.lng = parseFloat(lng);
    if (country) pin.country = country.trim();
    if (type) pin.type = type;
    if (notes !== undefined) pin.notes = notes;
    if (visitDate !== undefined) pin.visitDate = visitDate;
    if (rating !== undefined) pin.rating = rating;
    if (isPublic !== undefined) pin.isPublic = isPublic;
    
    const updatedPin = await pin.save();
    console.log('✅ Pin updated successfully');
    
    res.json({
      success: true,
      message: 'Pin updated successfully',
      pin: updatedPin
    });
    
  } catch (err) {
    console.error('❌ Error updating pin:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error updating pin',
      error: err.message 
    });
  }
});

// @route   DELETE /api/pins/:id
// @desc    Delete a pin
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('🗑️ DELETE /api/pins/:id - Deleting pin:', req.params.id);
    
    // Find and delete pin, ensuring it belongs to the user
    const deletedPin = await Pin.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!deletedPin) {
      return res.status(404).json({
        success: false,
        message: 'Pin not found or you do not have permission to delete it'
      });
    }
    
    console.log('✅ Pin deleted successfully');
    res.json({ 
      success: true,
      message: 'Pin deleted successfully' 
    });
  } catch (err) {
    console.error('❌ Error deleting pin:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting pin',
      error: err.message 
    });
  }
});

// @route   GET /api/pins/stats
// @desc    Get user's travel statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    console.log('📊 GET /api/pins/stats - Getting stats for user:', req.user.username);
    
    const userId = req.user._id;
    
    // Get basic counts
    const totalPins = await Pin.countDocuments({ user: userId });
    const visitedCount = await Pin.countDocuments({ user: userId, type: 'visited' });
    const dreamCount = await Pin.countDocuments({ user: userId, type: 'dream' });
    
    // Get pins by type
    const pins = await Pin.find({ user: userId });
    
    // Calculate continent stats (simplified)
    const continentMap = {
      'Europe': ['United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark'],
      'Asia': ['China', 'India', 'Japan', 'South Korea', 'Thailand', 'Singapore', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam'],
      'North America': ['United States', 'Canada', 'Mexico'],
      'South America': ['Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia'],
      'Africa': ['Nigeria', 'South Africa', 'Egypt', 'Kenya', 'Morocco', 'Niger'],
      'Oceania': ['Australia', 'New Zealand', 'Fiji']
    };
    
    const continentStats = {};
    pins.forEach(pin => {
      for (const [continent, countries] of Object.entries(continentMap)) {
        if (countries.includes(pin.country)) {
          continentStats[continent] = (continentStats[continent] || 0) + 1;
          break;
        }
      }
    });
    
    const stats = {
      totalPins,
      visitedCount,
      dreamCount,
      continentStats,
      countries: pins.map(pin => ({
        country: pin.country,
        type: pin.type,
        visitDate: pin.visitDate,
        rating: pin.rating
      }))
    };
    
    console.log('✅ Stats calculated successfully');
    res.json({
      success: true,
      stats
    });
    
  } catch (err) {
    console.error('❌ Error getting stats:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error getting statistics',
      error: err.message 
    });
  }
});

module.exports = router;