const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Photo = require('../models/Photo');
const { auth } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/photos');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `photo-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// @route   GET /api/photos/country/:countryCode
// @desc    Get all photos for a country by the authenticated user
// @access  Private
router.get('/country/:countryCode', auth, async (req, res) => {
  try {
    const { countryCode } = req.params;
    const userId = req.user._id;
    
    console.log('📸 GET /api/photos/country/:countryCode - Getting photos for:', countryCode, 'user:', req.user.username);
    
    const photos = await Photo.getByUserAndCountry(userId, countryCode);
    
    console.log(`✅ Found ${photos.length} photos for ${countryCode}`);
    
    res.json({
      success: true,
      photos: photos,
      total: photos.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching photos:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching photos'
    });
  }
});

// @route   GET /api/photos/country/:countryCode/public
// @desc    Get public photos for a country
// @access  Public
router.get('/country/:countryCode/public', async (req, res) => {
  try {
    const { countryCode } = req.params;
    const { limit = 50 } = req.query;
    
    console.log('🌍 GET /api/photos/country/:countryCode/public - Getting public photos for:', countryCode);
    
    const photos = await Photo.getPublicByCountry(countryCode, parseInt(limit));
    
    console.log(`✅ Found ${photos.length} public photos for ${countryCode}`);
    
    res.json({
      success: true,
      photos: photos,
      total: photos.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching public photos:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching public photos'
    });
  }
});

// @route   POST /api/photos/upload
// @desc    Upload photos for a country
// @access  Private
router.post('/upload', auth, upload.array('photos', 10), async (req, res) => {
  try {
    const { country, countryCode, caption, tags, isPublic = false, location } = req.body;
    const userId = req.user._id;
    
    console.log('📸 POST /api/photos/upload - Uploading photos for:', country, 'user:', req.user.username);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No photos uploaded'
      });
    }
    
    if (!country || !countryCode) {
      return res.status(400).json({
        success: false,
        message: 'Country and country code are required'
      });
    }
    
    const savedPhotos = [];
    
    for (const file of req.files) {
      try {
        // Create photo record
        const photo = new Photo({
          user: userId,
          country: country.trim(),
          countryCode: countryCode.trim().toUpperCase(),
          filename: file.filename,
          originalName: file.originalname,
          url: `/uploads/photos/${file.filename}`,
          mimeType: file.mimetype,
          size: file.size,
          caption: caption || '',
          tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
          isPublic: isPublic === 'true',
          location: location ? JSON.parse(location) : null
        });
        
        const savedPhoto = await photo.save();
        savedPhotos.push(savedPhoto);
        
        console.log('✅ Photo saved:', savedPhoto.filename);
        
      } catch (photoError) {
        console.error('❌ Error saving individual photo:', file.filename, photoError);
        // Continue with other photos
      }
    }
    
    console.log(`✅ Successfully uploaded ${savedPhotos.length} photos`);
    
    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${savedPhotos.length} photos`,
      photos: savedPhotos
    });
    
  } catch (error) {
    console.error('❌ Error uploading photos:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading photos'
    });
  }
});

// @route   POST /api/photos/upload-base64
// @desc    Upload photos as base64 (for client-side file handling)
// @access  Private
router.post('/upload-base64', auth, async (req, res) => {
  try {
    const { photos, country, countryCode } = req.body;
    const userId = req.user._id;
    
    console.log('📸 POST /api/photos/upload-base64 - Uploading base64 photos for:', country);
    
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No photos provided'
      });
    }
    
    if (!country || !countryCode) {
      return res.status(400).json({
        success: false,
        message: 'Country and country code are required'
      });
    }
    
    const savedPhotos = [];
    
    for (const photoData of photos) {
      try {
        const { base64, filename, caption, tags, isPublic } = photoData;
        
        if (!base64 || !filename) {
          console.error('❌ Missing base64 or filename for photo');
          continue;
        }
        
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(filename);
        const newFilename = `photo-${uniqueSuffix}${ext}`;
        
        // Create photo record with base64 data
        const photo = new Photo({
          user: userId,
          country: country.trim(),
          countryCode: countryCode.trim().toUpperCase(),
          filename: newFilename,
          originalName: filename,
          url: base64, // Store base64 directly for now
          mimeType: base64.split(';')[0].split(':')[1] || 'image/jpeg',
          size: Math.round((base64.length * 3) / 4), // Approximate size
          caption: caption || '',
          tags: tags || [],
          isPublic: isPublic || false
        });
        
        const savedPhoto = await photo.save();
        savedPhotos.push(savedPhoto);
        
        console.log('✅ Base64 photo saved:', savedPhoto.filename);
        
      } catch (photoError) {
        console.error('❌ Error saving individual base64 photo:', photoError);
      }
    }
    
    console.log(`✅ Successfully uploaded ${savedPhotos.length} base64 photos`);
    
    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${savedPhotos.length} photos`,
      photos: savedPhotos
    });
    
  } catch (error) {
    console.error('❌ Error uploading base64 photos:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading photos'
    });
  }
});

// @route   PUT /api/photos/:photoId
// @desc    Update photo details
// @access  Private
router.put('/:photoId', auth, async (req, res) => {
  try {
    const { photoId } = req.params;
    const { caption, tags, isPublic } = req.body;
    const userId = req.user._id;
    
    console.log('📝 PUT /api/photos/:photoId - Updating photo:', photoId);
    
    const photo = await Photo.findOne({ _id: photoId, user: userId });
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found or you do not have permission to update it'
      });
    }
    
    // Update fields
    if (caption !== undefined) photo.caption = caption;
    if (tags !== undefined) photo.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    if (isPublic !== undefined) photo.isPublic = isPublic;
    
    const updatedPhoto = await photo.save();
    
    console.log('✅ Photo updated successfully');
    
    res.json({
      success: true,
      message: 'Photo updated successfully',
      photo: updatedPhoto
    });
    
  } catch (error) {
    console.error('❌ Error updating photo:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating photo'
    });
  }
});

// @route   DELETE /api/photos/:photoId
// @desc    Delete a photo (soft delete)
// @access  Private
router.delete('/:photoId', auth, async (req, res) => {
  try {
    const { photoId } = req.params;
    const userId = req.user._id;
    
    console.log('🗑️ DELETE /api/photos/:photoId - Deleting photo:', photoId);
    
    const photo = await Photo.findOne({ _id: photoId, user: userId });
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found or you do not have permission to delete it'
      });
    }
    
    await photo.softDelete();
    
    console.log('✅ Photo deleted successfully');
    
    res.json({
      success: true,
      message: 'Photo deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting photo:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting photo'
    });
  }
});

// @route   POST /api/photos/:photoId/like
// @desc    Toggle like on a photo
// @access  Private
router.post('/:photoId/like', auth, async (req, res) => {
  try {
    const { photoId } = req.params;
    const userId = req.user._id;
    
    console.log('❤️ POST /api/photos/:photoId/like - Toggling like for photo:', photoId);
    
    const photo = await Photo.findById(photoId);
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }
    
    const likeCount = await photo.toggleLike(userId);
    
    console.log('✅ Like toggled successfully');
    
    res.json({
      success: true,
      message: 'Like toggled successfully',
      likeCount: likeCount,
      isLiked: photo.likes.includes(userId)
    });
    
  } catch (error) {
    console.error('❌ Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling like'
    });
  }
});

// @route   GET /api/photos/user/stats
// @desc    Get user's photo statistics
// @access  Private
router.get('/user/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log('📊 GET /api/photos/user/stats - Getting photo stats for:', req.user.username);
    
    const stats = await Photo.aggregate([
      {
        $match: {
          user: userId,
          deletedAt: null
        }
      },
      {
        $group: {
          _id: null,
          totalPhotos: { $sum: 1 },
          totalSize: { $sum: '$size' },
          totalLikes: { $sum: { $size: '$likes' } },
          totalViews: { $sum: '$views' },
          countriesCount: { $addToSet: '$countryCode' },
          publicPhotos: {
            $sum: {
              $cond: [{ $eq: ['$isPublic', true] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalPhotos: 1,
          totalSize: 1,
          totalLikes: 1,
          totalViews: 1,
          countriesCount: { $size: '$countriesCount' },
          publicPhotos: 1,
          avgLikesPerPhoto: {
            $cond: [
              { $eq: ['$totalPhotos', 0] },
              0,
              { $divide: ['$totalLikes', '$totalPhotos'] }
            ]
          }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalPhotos: 0,
      totalSize: 0,
      totalLikes: 0,
      totalViews: 0,
      countriesCount: 0,
      publicPhotos: 0,
      avgLikesPerPhoto: 0
    };
    
    console.log('✅ Photo stats calculated successfully');
    
    res.json({
      success: true,
      stats: result
    });
    
  } catch (error) {
    console.error('❌ Error getting photo stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting photo statistics'
    });
  }
});

// Serve uploaded photos statically
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = router;