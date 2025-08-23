// src/components/GallerySection.jsx
import React, { useState, useEffect } from "react";
import SlideshowView from "./Gallery/SlideshowView";
import GridView from "./Gallery/GridView";
import PostModal from "./Gallery/PostModal";
import ActionButtons from "./Gallery/ActionButtons";
import "./GallerySection.css";

const GallerySection = ({ photos, posts = [], galleryView, setGalleryView, onPhotoUpload, onPhotoRefresh, countryName }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showPostView, setShowPostView] = useState(false);
  const [allPhotos, setAllPhotos] = useState(photos); // Track all photos including uploaded ones
  const [allPosts, setAllPosts] = useState(posts); // Track all posts

  // Set default view to grid (as requested)
  useEffect(() => {
    if (!galleryView || galleryView === "tile") {
      setGalleryView("grid");
    }
  }, [galleryView, setGalleryView]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [galleryView, allPhotos.length]);

  // Update allPhotos when photos prop changes
  useEffect(() => {
    setAllPhotos(photos);
  }, [photos]);

  // Update allPosts when posts prop changes
  useEffect(() => {
    setAllPosts(posts);
  }, [posts]);

  const toggleView = () => {
    const views = ["slideshow", "grid"];
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

  // FIXED: Handle posts created from UploadOrganizer
  const handlePostsCreated = (createdPosts) => {
    console.log('📝 Posts created:', createdPosts);
    
    // Add the new posts to our local state
    setAllPosts(prev => [...createdPosts, ...prev]);
    
    // Refresh the country data to get the latest from backend
    if (onPhotoRefresh) {
      onPhotoRefresh();
    }
  };

  return (
    <div className="gallery-section">
      <div className="gallery-header">
        <h2>Gallery</h2>
      </div>

      <div className={`photo-preview ${galleryView}`}>
        {allPhotos.length === 0 && allPosts.length === 0 ? (
          <div className="no-photos-message">
            <p>No photos uploaded yet. Use the + button to get started!</p>
          </div>
        ) : galleryView === "slideshow" ? (
          <SlideshowView 
            photos={[...allPosts.flatMap(post => post.images), ...allPhotos]}
            currentSlide={currentSlide}
            setCurrentSlide={setCurrentSlide}
          />
        ) : (
          <GridView 
            photos={allPhotos}
            posts={allPosts}
            onPhotoClick={openPostView}
          />
        )}
      </div>

      <ActionButtons
        galleryView={galleryView}
        onToggleView={toggleView}
        onFileUpload={handleFileUpload}
        onPostsCreated={handlePostsCreated} // FIXED: Now properly defined
        countryName={countryName}
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