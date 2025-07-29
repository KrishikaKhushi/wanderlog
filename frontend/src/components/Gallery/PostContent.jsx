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
  return (
    <div className="post-content">
      <div className="post-image-container">
        <img src={selectedImage} alt="Post" className="post-image" />
        
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
            {photos.map((_, index) => (
              <div 
                key={index}
                className={`dot ${index === selectedImageIndex ? 'active' : ''}`}
                onClick={() => onImageSelect(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostContent;