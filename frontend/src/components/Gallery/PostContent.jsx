// src/components/Gallery/PostContent.jsx
import React from "react";
import "./PostContent.css";

const PostContent = ({ 
  selectedImage, 
  selectedImageIndex, 
  photos, 
  onPrevPost, 
  onNextPost, 
  onImageSelect 
}) => {
  // Handle both photo objects and direct URL strings
  const getImageUrl = (image) => {
    if (typeof image === 'string') {
      return image; // It's already a URL string
    }
    return image?.url || image; // It's a photo object, get the url property
  };

  const getImageAlt = (image, index) => {
    if (typeof image === 'object' && image?.caption) {
      return image.caption;
    }
    return `Post image ${index + 1}`;
  };

  const currentImageUrl = getImageUrl(selectedImage);
  const currentImageAlt = getImageAlt(selectedImage, selectedImageIndex);

  return (
    <div className="post-content">
      <div className="post-image-container">
        <img 
          src={currentImageUrl} 
          alt={currentImageAlt} 
          className="post-image" 
        />
        
        {/* Navigation arrows */}
        {photos.length > 1 && selectedImageIndex > 0 && (
          <button className="post-nav prev" onClick={onPrevPost}>
            <span>‹</span>
          </button>
        )}
        {photos.length > 1 && selectedImageIndex < photos.length - 1 && (
          <button className="post-nav next" onClick={onNextPost}>
            <span>›</span>
          </button>
        )}
        
        {/* Image indicator dots */}
        {photos.length > 1 && (
          <div className="image-dots">
            {photos.map((photo, index) => (
              <div 
                key={index}
                className={`dot ${index === selectedImageIndex ? 'active' : ''}`}
                onClick={() => onImageSelect(index)}
                title={typeof photo === 'object' ? photo.caption || `Image ${index + 1}` : `Image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Photo info section */}
      {typeof selectedImage === 'object' && (
        <div className="post-info">
          {selectedImage.caption && (
            <div className="photo-caption">
              <p>{selectedImage.caption}</p>
            </div>
          )}
          
          <div className="photo-stats">
            {selectedImage.likes && (
              <span className="stat-item">
                ❤️ {selectedImage.likes.length || 0}
              </span>
            )}
            {selectedImage.views !== undefined && (
              <span className="stat-item">
                👁️ {selectedImage.views}
              </span>
            )}
            {selectedImage.uploadedAt && (
              <span className="stat-item">
                📅 {new Date(selectedImage.uploadedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {selectedImage.tags && selectedImage.tags.length > 0 && (
            <div className="photo-tags">
              {selectedImage.tags.map((tag, index) => (
                <span key={index} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostContent;