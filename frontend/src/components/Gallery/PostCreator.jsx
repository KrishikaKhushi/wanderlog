// src/components/Gallery/PostCreator.jsx
import React, { useState, useEffect } from "react";
import "./PostCreator.css";

const PostCreator = ({ folder, folderIndex, totalFolders, onPostCreated, onBack }) => {
  const [caption, setCaption] = useState("");
  const [taggedPeople, setTaggedPeople] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [location, setLocation] = useState("");
  const [hideFromFeed, setHideFromFeed] = useState(false);
  const [turnOffComments, setTurnOffComments] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset form when folder changes
  useEffect(() => {
    setCaption("");
    setTaggedPeople([]);
    setNewTag("");
    setLocation("");
    setHideFromFeed(false);
    setTurnOffComments(false);
    setCurrentImageIndex(0);
  }, [folderIndex]);

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !taggedPeople.includes(newTag.trim())) {
      setTaggedPeople([...taggedPeople, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTaggedPeople(taggedPeople.filter(tag => tag !== tagToRemove));
  };

  const handleNext = () => {
    const postData = {
      caption,
      taggedPeople,
      location,
      hideFromFeed,
      turnOffComments
    };
    onPostCreated(folderIndex, postData);
  };

  const handleSkip = () => {
    const postData = {
      caption: "",
      taggedPeople: [],
      location: "",
      hideFromFeed: false,
      turnOffComments: false
    };
    onPostCreated(folderIndex, postData);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % folder.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + folder.images.length) % folder.images.length);
  };

  // Helper function to check if image URL is valid
  const isValidImageUrl = (url) => {
    return url && typeof url === 'string' && (
      url.startsWith('http') || 
      url.startsWith('blob:') || 
      url.startsWith('data:image/')
    );
  };

  return (
    <div className="post-creator">
      <div className="creator-content">
        <div className="image-preview-section">
          <div className="preview-header">
            <h4>{folder.name}</h4>
            <span className="image-counter">
              {currentImageIndex + 1} of {folder.images.length}
            </span>
          </div>
          
          <div className="image-carousel">
            <div className="carousel-container">
              {isValidImageUrl(folder.images[currentImageIndex]) ? (
                <img 
                  src={folder.images[currentImageIndex]} 
                  alt={`Preview ${currentImageIndex + 1}`}
                  className="preview-main-image"
                  onError={(e) => {
                    console.error('Failed to load image:', folder.images[currentImageIndex]);
                    e.target.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', folder.images[currentImageIndex]);
                  }}
                />
              ) : (
                <div className="image-error">
                  <p>Unable to load image</p>
                  <small>{folder.images[currentImageIndex]}</small>
                </div>
              )}
              
              {folder.images.length > 1 && (
                <>
                  <button className="carousel-nav prev" onClick={prevImage}>
                    ‹
                  </button>
                  <button className="carousel-nav next" onClick={nextImage}>
                    ›
                  </button>
                  
                  <div className="carousel-dots">
                    {folder.images.map((_, index) => (
                      <button
                        key={index}
                        className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {folder.images.length > 1 && (
              <div className="thumbnail-strip">
                {folder.images.map((imageUrl, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    {isValidImageUrl(imageUrl) ? (
                      <img 
                        src={imageUrl} 
                        alt={`Thumb ${index + 1}`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="thumbnail-error">❌</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="post-details-section">
          <div className="user-info-section">
            <div className="user-avatar">👤</div>
            <span className="username">your_username</span>
          </div>

          <div className="caption-section">
            <label>Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="caption-textarea"
              maxLength={2200}
            />
            <div className="caption-counter">{caption.length}/2,200</div>
          </div>

          <div className="tag-section">
            <label>Tag People</label>
            <form onSubmit={handleAddTag} className="tag-form">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Search people..."
                className="tag-input"
              />
              <button type="submit" className="add-tag-btn">Add</button>
            </form>
            {taggedPeople.length > 0 && (
              <div className="tagged-people">
                {taggedPeople.map((person, index) => (
                  <span key={index} className="tag-pill">
                    @{person}
                    <button 
                      onClick={() => handleRemoveTag(person)}
                      className="remove-tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="location-section">
            <label>Add Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where was this taken?"
              className="location-input"
            />
          </div>

          <div className="advanced-settings">
            <label>Advanced Settings</label>
            <div className="settings-options">
              <label className="setting-option">
                <input
                  type="checkbox"
                  checked={hideFromFeed}
                  onChange={(e) => setHideFromFeed(e.target.checked)}
                />
                <span>Hide from feed</span>
              </label>
              <label className="setting-option">
                <input
                  type="checkbox"
                  checked={turnOffComments}
                  onChange={(e) => setTurnOffComments(e.target.checked)}
                />
                <span>Turn off commenting</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="creator-actions">
        <button className="back-btn" onClick={onBack}>
          ← Back to Organize
        </button>
        
        <div className="progress-info">
          Post {folderIndex + 1} of {totalFolders}
        </div>
        
        <div className="action-buttons">
          <button className="skip-btn" onClick={handleSkip}>
            Skip
          </button>
          <button className="next-btn" onClick={handleNext}>
            {folderIndex === totalFolders - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCreator;