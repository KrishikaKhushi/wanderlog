// src/components/GallerySection.jsx
import React, { useState, useEffect } from "react";
import SlideshowView from "./Gallery/SlideshowView";
import GridView from "./Gallery/GridView";
import PostModal from "./Gallery/PostModal";
import ActionButtons from "./Gallery/ActionButtons";
import "./GallerySection.css";

const GallerySection = ({ photos, galleryView, setGalleryView, onPhotoUpload, countryName }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showPostView, setShowPostView] = useState(false);
  const [posts, setPosts] = useState([]); // Store shared posts
  const [allPhotos, setAllPhotos] = useState(photos); // Track all photos including uploaded ones

  // Set default view to slideshow
  useEffect(() => {
    if (!galleryView || galleryView === "tile") {
      setGalleryView("slideshow");
    }
  }, [galleryView, setGalleryView]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [galleryView, allPhotos.length]);

  // Update allPhotos when photos prop changes
  useEffect(() => {
    setAllPhotos(photos);
  }, [photos]);

  const toggleView = () => {
    const views = ["slideshow", "album"];
    const currentIndex = views.indexOf(galleryView);
    const nextIndex = (currentIndex + 1) % views.length;
    setGalleryView(views[nextIndex]);
  };

  const openPostView = (photoOrPost, index) => {
    // Check if it's a post object or a single photo
    if (photoOrPost && typeof photoOrPost === 'object' && photoOrPost.images) {
      // It's a post - show the post's images
      setSelectedImage(photoOrPost.images[0]);
      setSelectedImageIndex(0);
      setShowPostView({ type: 'post', data: photoOrPost });
    } else {
      // It's a single photo
      setSelectedImage(photoOrPost);
      setSelectedImageIndex(index);
      setShowPostView({ type: 'photo', data: allPhotos });
    }
  };

  const closePostView = () => {
    setShowPostView(false);
    setSelectedImage(null);
  };

  const handleFileUpload = (e) => {
    if (onPhotoUpload) {
      onPhotoUpload(e);
    }
  };

  const handlePostsCreated = (posts, backendPhotos) => {
    if (onPostsCreated) {
      onPostsCreated(posts);
    }
    
    // If we have backend photos, add them to the photo state
    if (backendPhotos && backendPhotos.length > 0) {
      const newPhotos = backendPhotos.map(photo => ({
        id: photo._id,
        url: photo.url,
        caption: photo.caption,
        tags: photo.tags,
        uploadedAt: photo.uploadedAt,
        isPublic: photo.isPublic,
        likes: photo.likes || [],
        views: photo.views || 0
      }));
      
      // Update the photos state by calling the parent's photo update function
      if (onPhotoUpload) {
        // Create a fake event to trigger the photo update
        const fakeEvent = {
          target: {
            files: [] // Empty since we're passing the processed photos directly
          },
          backendPhotos: newPhotos // Pass the processed photos
        };
        onPhotoUpload(fakeEvent);
      }
    }
    
    setSelectedFiles([]);
    setShowUploadOrganizer(false);
  };

  return (
    <div className="gallery-section">
      <div className="gallery-header">
        <h2>Gallery</h2>
      </div>

      <div className={`photo-preview ${galleryView}`}>
        {allPhotos.length === 0 ? (
          <div className="no-photos-message">
            <p>No photos uploaded yet. Use the + button to get started!</p>
          </div>
        ) : galleryView === "slideshow" ? (
          <SlideshowView 
            photos={allPhotos}
            currentSlide={currentSlide}
            setCurrentSlide={setCurrentSlide}
          />
        ) : (
          <GridView 
            photos={allPhotos}
            posts={posts}
            onPhotoClick={openPostView}
          />
        )}
      </div>

      <ActionButtons
        galleryView={galleryView}
        onToggleView={toggleView}
        onFileUpload={handleFileUpload}
        onPostsCreated={handlePostsCreated}
        countryName={countryName} // ADD THIS LINE
      />

      {showPostView && selectedImage && (
        <PostModal
          selectedImage={selectedImage}
          selectedImageIndex={selectedImageIndex}
          setSelectedImageIndex={setSelectedImageIndex}
          photos={showPostView.type === 'post' ? showPostView.data.images : allPhotos}
          postData={showPostView.type === 'post' ? showPostView.data : null}
          onClose={closePostView}
        />
      )}
    </div>
  );
};

export default GallerySection;