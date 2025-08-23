// routes/posts.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Photo = require('../models/Photo');
const { auth } = require('../middleware/auth');

// @route   GET /api/posts/country/:countryCode
// @desc    Get all posts for a country by the authenticated user
// @access  Private
router.get('/country/:countryCode', auth, async (req, res) => {
  try {
    const { countryCode } = req.params;
    const userId = req.user._id;
    
    console.log('📝 GET /api/posts/country/:countryCode - Getting posts for:', countryCode);
    
    const posts = await Post.getByUserAndCountry(userId, countryCode);
    
    console.log(`✅ Found ${posts.length} posts for ${countryCode}`);
    
    res.json({
      success: true,
      posts: posts,
      total: posts.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching posts'
    });
  }
});

// @route   POST /api/posts/create
// @desc    Create a new post with multiple photos
// @access  Private
router.post('/create', auth, async (req, res) => {
  try {
    const { country, countryCode, title, description, photoIds, tags, isPublic } = req.body;
    const userId = req.user._id;
    
    console.log('📝 POST /api/posts/create - Creating post for:', country);
    
    if (!country || !countryCode) {
      return res.status(400).json({
        success: false,
        message: 'Country and country code are required'
      });
    }
    
    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one photo is required'
      });
    }
    
    // Verify all photos belong to the user
    const photos = await Photo.find({
      _id: { $in: photoIds },
      user: userId,
      deletedAt: null
    });
    
    if (photos.length !== photoIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some photos not found or do not belong to you'
      });
    }
    
    // Create the post
    const post = new Post({
      user: userId,
      country: country.trim(),
      countryCode: countryCode.trim().toUpperCase(),
      title: title?.trim() || '',
      description: description?.trim() || '',
      photos: photoIds,
      tags: tags || [],
      isPublic: isPublic || false
    });
    
    const savedPost = await post.save();
    
    // Populate the post with photos
    await savedPost.populate('photos');
    
    console.log('✅ Post created successfully');
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: savedPost
    });
    
  } catch (error) {
    console.error('❌ Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating post'
    });
  }
});

// @route   POST /api/posts/create-with-upload
// @desc    Upload photos and create a post in one go
// @access  Private
router.post('/create-with-upload', auth, async (req, res) => {
  try {
    const { photos, country, countryCode, title, description, tags, isPublic } = req.body;
    const userId = req.user._id;
    
    console.log('📝 POST /api/posts/create-with-upload - Creating post with upload for:', country);
    
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one photo is required'
      });
    }
    
    if (!country || !countryCode) {
      return res.status(400).json({
        success: false,
        message: 'Country and country code are required'
      });
    }
    
    // First, save all the photos
    const savedPhotos = [];
    
    for (const photoData of photos) {
      try {
        const { base64, filename, caption, photoTags, isPhotoPublic } = photoData;
        
        if (!base64 || !filename) {
          console.error('❌ Missing base64 or filename for photo');
          continue;
        }
        
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const path = require('path');
        const ext = path.extname(filename);
        const newFilename = `photo-${uniqueSuffix}${ext}`;
        
        // Create photo record
        const photo = new Photo({
          user: userId,
          country: country.trim(),
          countryCode: countryCode.trim().toUpperCase(),
          filename: newFilename,
          originalName: filename,
          url: base64,
          mimeType: base64.split(';')[0].split(':')[1] || 'image/jpeg',
          size: Math.round((base64.length * 3) / 4),
          caption: caption || '',
          tags: photoTags || [],
          isPublic: isPhotoPublic || false
        });
        
        const savedPhoto = await photo.save();
        savedPhotos.push(savedPhoto);
        
      } catch (photoError) {
        console.error('❌ Error saving individual photo:', photoError);
      }
    }
    
    if (savedPhotos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Failed to save any photos'
      });
    }
    
    // Create the post with the saved photos
    const post = new Post({
      user: userId,
      country: country.trim(),
      countryCode: countryCode.trim().toUpperCase(),
      title: title?.trim() || '',
      description: description?.trim() || '',
      photos: savedPhotos.map(p => p._id),
      tags: tags || [],
      isPublic: isPublic || false
    });
    
    const savedPost = await post.save();
    await savedPost.populate('photos');
    
    console.log(`✅ Post created with ${savedPhotos.length} photos`);
    
    res.status(201).json({
      success: true,
      message: `Post created successfully with ${savedPhotos.length} photos`,
      post: savedPost,
      photos: savedPhotos
    });
    
  } catch (error) {
    console.error('❌ Error creating post with upload:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating post'
    });
  }
});

// @route   PUT /api/posts/:postId
// @desc    Update post details
// @access  Private
router.put('/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, description, tags, isPublic } = req.body;
    const userId = req.user._id;
    
    console.log('📝 PUT /api/posts/:postId - Updating post:', postId);
    
    const post = await Post.findOne({ _id: postId, user: userId, deletedAt: null });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or you do not have permission to update it'
      });
    }
    
    // Update fields
    if (title !== undefined) post.title = title.trim();
    if (description !== undefined) post.description = description.trim();
    if (tags !== undefined) post.tags = Array.isArray(tags) ? tags : [];
    if (isPublic !== undefined) post.isPublic = isPublic;
    
    const updatedPost = await post.save();
    await updatedPost.populate('photos');
    
    console.log('✅ Post updated successfully');
    
    res.json({
      success: true,
      message: 'Post updated successfully',
      post: updatedPost
    });
    
  } catch (error) {
    console.error('❌ Error updating post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating post'
    });
  }
});

// @route   DELETE /api/posts/:postId
// @desc    Delete a post (soft delete)
// @access  Private
router.delete('/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    
    console.log('🗑️ DELETE /api/posts/:postId - Deleting post:', postId);
    
    const post = await Post.findOne({ _id: postId, user: userId, deletedAt: null });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or you do not have permission to delete it'
      });
    }
    
    await post.softDelete();
    
    console.log('✅ Post deleted successfully');
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting post'
    });
  }
});

// @route   POST /api/posts/:postId/like
// @desc    Toggle like on a post
// @access  Private
router.post('/:postId/like', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    
    console.log('❤️ POST /api/posts/:postId/like - Toggling like for post:', postId);
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    const likeCount = await post.toggleLike(userId);
    
    console.log('✅ Like toggled successfully');
    
    res.json({
      success: true,
      message: 'Like toggled successfully',
      likeCount: likeCount,
      isLiked: post.likes.includes(userId)
    });
    
  } catch (error) {
    console.error('❌ Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling like'
    });
  }
});

module.exports = router;