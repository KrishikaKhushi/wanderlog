// src/components/Gallery/GridView.jsx
import React, { useState } from "react";
import ShareModal from "./ShareModal";
import "./GridView.css";

const GridView = ({ photos, onPhotoClick, posts = [], onShare }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);

  const handleImageSelect = (photo, index) => {
    if (selectionMode) {
      setSelectedImages(prev => {
        if (prev.includes(photo)) {
          return prev.filter(img => img !== photo);
        } else {
          return [...prev, photo];
        }
      });
    } else {
      onPhotoClick(photo, index);
    }
  };

  const handleLongPress = (photo) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedImages([photo]);
    }
  };

  const handleShare = () => {
    if (selectedImages.length > 0) {
      setShowShareModal(true);
    }
  };

  const handleShareComplete = (shareData) => {
    console.log("Sharing:", shareData);
    if (onShare) {
      onShare(shareData);
    }
    setSelectedImages([]);
    setSelectionMode(false);
    setShowShareModal(false);
  };

  const cancelSelection = () => {
    setSelectedImages([]);
    setSelectionMode(false);
  };

  // Display posts and remaining individual photos
  const displayItems = [
    ...posts.map((post, index) => ({ type: 'post', data: post, index })),
    ...photos.filter(photo => !posts.some(post => post.images.includes(photo)))
      .map((photo, index) => ({ type: 'photo', data: photo, index }))
  ];

  return (
    <div className="grid-view-container">
      {selectionMode && (
        <div className="selection-toolbar">
          <div className="selection-info">
            <button onClick={cancelSelection} className="cancel-selection">Cancel</button>
            <span>{selectedImages.length} selected</span>
          </div>
          <button 
            onClick={handleShare} 
            className="share-selected-btn"
            disabled={selectedImages.length === 0}
          >
            Share
          </button>
        </div>
      )}

      <div className="instagram-grid">
        {displayItems.map((item, gridIndex) => {
          if (item.type === 'post') {
            const post = item.data;
            return (
              <div 
                key={`post-${post.id}`} 
                className="instagram-post-preview post-carousel"
                onClick={() => onPhotoClick(post, 0)} // Pass the entire post object
              >
                <img
                  src={post.images[0]} // Show first image as thumbnail
                  alt={`${post.folderName || 'Post'} thumbnail`}
                  className="instagram-thumb"
                />
                {post.images.length > 1 && (
                  <div className="carousel-icon">📚</div>
                )}
                <div className="post-overlay">
                  <div className="post-stats">
                    <span>❤️ {post.likes || Math.floor(Math.random() * 50)}</span>
                    <span>💬 {post.comments || Math.floor(Math.random() * 20)}</span>
                  </div>
                </div>
              </div>
            );
          } else {
            const photo = item.data;
            const isSelected = selectedImages.includes(photo);
            return (
              <div 
                key={`photo-${gridIndex}`} 
                className={`instagram-post-preview ${isSelected ? 'selected' : ''}`}
                onClick={() => handleImageSelect(photo, item.index)}
                onMouseDown={(e) => {
                  const timer = setTimeout(() => handleLongPress(photo), 500);
                  const cleanup = () => {
                    clearTimeout(timer);
                    document.removeEventListener('mouseup', cleanup);
                  };
                  document.addEventListener('mouseup', cleanup);
                }}
              >
                <img
                  src={photo}
                  alt={`photo-${gridIndex}`}
                  className="instagram-thumb"
                />
                {selectionMode && (
                  <div className="selection-indicator">
                    {isSelected ? '✓' : '○'}
                  </div>
                )}
                <div className="post-overlay">
                  <div className="post-stats">
                    <span>❤️ {Math.floor(Math.random() * 50)}</span>
                    <span>💬 {Math.floor(Math.random() * 20)}</span>
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>

      {showShareModal && (
        <ShareModal
          selectedImages={selectedImages}
          onClose={() => setShowShareModal(false)}
          onShare={handleShareComplete}
        />
      )}
    </div>
  );
};

export default GridView;