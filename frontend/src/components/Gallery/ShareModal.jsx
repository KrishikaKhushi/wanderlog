// src/components/Gallery/ShareModal.jsx
import React, { useState } from "react";
import "./ShareModal.css";

const ShareModal = ({ selectedImages, onClose, onShare }) => {
  const [shareType, setShareType] = useState(null);
  const [caption, setCaption] = useState("");
  const [taggedPeople, setTaggedPeople] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [location, setLocation] = useState("");
  const [hideFromFeed, setHideFromFeed] = useState(false);
  const [turnOffComments, setTurnOffComments] = useState(false);

  const handleShareTypeSelection = (type) => {
    setShareType(type);
  };

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

  const handleShare = () => {
    const shareData = {
      type: shareType,
      images: selectedImages,
      caption,
      taggedPeople,
      location,
      hideFromFeed,
      turnOffComments
    };
    onShare(shareData);
    onClose();
  };

  if (!shareType) {
    return (
      <div className="share-modal-overlay">
        <div className="share-modal-container">
          <div className="share-modal-header">
            <h3>How would you like to share?</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          
          <div className="share-options">
            <div className="share-option" onClick={() => handleShareTypeSelection('individual')}>
              <div className="option-icon">📷</div>
              <div className="option-text">
                <h4>Individual Posts</h4>
                <p>Share each image as a separate post ({selectedImages.length} posts)</p>
              </div>
            </div>
            
            <div className="share-option" onClick={() => handleShareTypeSelection('carousel')}>
              <div className="option-icon">🎠</div>
              <div className="option-text">
                <h4>Carousel Post</h4>
                <p>Share all images in one post (swipeable carousel)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="share-modal-overlay">
      <div className="share-modal-container large">
        <div className="share-modal-header">
          <button className="back-button" onClick={() => setShareType(null)}>←</button>
          <h3>New Post</h3>
          <button className="share-button" onClick={handleShare}>Share</button>
        </div>

        <div className="share-content">
          <div className="image-preview-section">
            <h4>
              {shareType === 'individual' 
                ? `${selectedImages.length} Individual Posts` 
                : 'Carousel Post'
              }
            </h4>
            <div className="preview-images">
              {selectedImages.map((image, index) => (
                <div key={index} className="preview-image-container">
                  <img src={image} alt={`Preview ${index + 1}`} className="preview-image" />
                  {shareType === 'carousel' && index > 0 && (
                    <div className="carousel-indicator">{index + 1}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="post-details-section">
            <div className="user-info-section">
              <div className="user-avatar">👤</div>
              <span className="username">your_username</span>
            </div>

            <div className="caption-section">
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
              <h4>Tag People</h4>
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
              <h4>Add Location</h4>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where was this taken?"
                className="location-input"
              />
            </div>

            <div className="advanced-settings">
              <h4>Advanced Settings</h4>
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
    </div>
  );
};

export default ShareModal;