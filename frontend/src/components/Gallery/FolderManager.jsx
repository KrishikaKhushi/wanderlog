// src/components/Gallery/FolderManager.jsx
import React, { useState } from "react";
import "./FolderManager.css";

const FolderManager = ({ 
  folders, 
  unorganizedImages, 
  onAddFolder, 
  onRemoveFolder, 
  onMoveImageToFolder, 
  onRemoveImageFromFolder, 
  onComplete 
}) => {
  const [draggedImage, setDraggedImage] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);

  const handleDragStart = (e, imageUrl, source) => {
    console.log('Drag started:', imageUrl, source);
    setDraggedImage(imageUrl);
    setDraggedFrom(source);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", imageUrl); // Set data for better compatibility
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetFolderId) => {
    e.preventDefault();
    console.log('Drop event:', draggedImage, draggedFrom, targetFolderId);
    
    if (!draggedImage) {
      // Fallback to dataTransfer data
      const imageUrl = e.dataTransfer.getData("text/plain");
      if (imageUrl) {
        console.log('Using fallback image URL:', imageUrl);
        // Need to determine source from current state
        if (unorganizedImages.includes(imageUrl)) {
          onMoveImageToFolder(imageUrl, targetFolderId);
        } else {
          // Find which folder it came from
          const sourceFolder = folders.find(f => f.images.includes(imageUrl));
          if (sourceFolder && sourceFolder.id !== targetFolderId) {
            onRemoveImageFromFolder(imageUrl, sourceFolder.id);
            onMoveImageToFolder(imageUrl, targetFolderId);
          }
        }
      }
      return;
    }

    if (draggedFrom === "unorganized") {
      onMoveImageToFolder(draggedImage, targetFolderId);
    } else if (draggedFrom !== targetFolderId) {
      // Moving from one folder to another
      onRemoveImageFromFolder(draggedImage, draggedFrom);
      onMoveImageToFolder(draggedImage, targetFolderId);
    }

    setDraggedImage(null);
    setDraggedFrom(null);
  };

  const handleDropToUnorganized = (e) => {
    e.preventDefault();
    console.log('Drop to unorganized:', draggedImage, draggedFrom);
    
    if (!draggedImage) {
      const imageUrl = e.dataTransfer.getData("text/plain");
      if (imageUrl && !unorganizedImages.includes(imageUrl)) {
        // Find which folder it came from
        const sourceFolder = folders.find(f => f.images.includes(imageUrl));
        if (sourceFolder) {
          onRemoveImageFromFolder(imageUrl, sourceFolder.id);
        }
      }
      return;
    }
    
    if (draggedFrom === "unorganized") return;

    onRemoveImageFromFolder(draggedImage, draggedFrom);
    setDraggedImage(null);
    setDraggedFrom(null);
  };

  const canProceed = () => {
    return folders.some(folder => folder.images.length > 0);
  };

  const isValidImageUrl = (url) => {
    return url && typeof url === 'string' && (
      url.startsWith('http') || 
      url.startsWith('blob:') || 
      url.startsWith('data:image/')
    );
  };

  return (
    <div className="folder-manager">
      <div className="unorganized-section">
        <h4>Selected Images ({unorganizedImages.length})</h4>
        <div 
          className="unorganized-grid"
          onDragOver={handleDragOver}
          onDrop={handleDropToUnorganized}
        >
          {unorganizedImages.map((imageUrl, index) => (
            <div
              key={index}
              className="unorganized-image"
              draggable
              onDragStart={(e) => handleDragStart(e, imageUrl, "unorganized")}
            >
              {isValidImageUrl(imageUrl) ? (
                <img 
                  src={imageUrl} 
                  alt={`Unorganized ${index}`}
                  onError={(e) => {
                    console.error('Failed to load image:', imageUrl);
                    e.target.style.display = 'none';
                    e.target.parentNode.classList.add('image-error');
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', imageUrl.substring(0, 50) + '...');
                  }}
                />
              ) : (
                <div className="image-error">
                  <p>Invalid image</p>
                </div>
              )}
            </div>
          ))}
          {unorganizedImages.length === 0 && (
            <div className="empty-message">
              All images have been organized!
            </div>
          )}
        </div>
      </div>

      <div className="folders-section">
        <div className="folders-header">
          <h4>Post Folders</h4>
          <button className="add-folder-btn" onClick={onAddFolder}>
            + Add Folder
          </button>
        </div>
        
        <div className="folders-grid">
          {folders.map((folder) => (
            <div key={folder.id} className="post-folder">
              <div className="folder-header">
                <span className="folder-name">{folder.name}</span>
                {folders.length > 1 && (
                  <button 
                    className="remove-folder-btn"
                    onClick={() => onRemoveFolder(folder.id)}
                  >
                    ×
                  </button>
                )}
              </div>
              
              <div 
                className={`folder-drop-zone ${folder.images.length === 0 ? 'empty' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, folder.id)}
              >
                {folder.images.length === 0 ? (
                  <div className="drop-placeholder">
                    <div className="drop-icon">📁</div>
                    <p>Drag images here</p>
                  </div>
                ) : (
                  <div className="folder-images">
                    {folder.images.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="folder-image"
                        draggable
                        onDragStart={(e) => handleDragStart(e, imageUrl, folder.id)}
                      >
                        {isValidImageUrl(imageUrl) ? (
                          <img 
                            src={imageUrl} 
                            alt={`Folder ${folder.id} - ${index}`}
                            onError={(e) => {
                              console.error('Failed to load image:', imageUrl);
                              e.target.style.display = 'none';
                              e.target.parentNode.classList.add('image-error');
                            }}
                          />
                        ) : (
                          <div className="image-error">
                            <p>❌</p>
                          </div>
                        )}
                        <button 
                          className="remove-image-btn"
                          onClick={() => onRemoveImageFromFolder(imageUrl, folder.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="folder-info">
                {folder.images.length} image{folder.images.length !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="organizer-actions">
        <div className="help-text">
          Drag images from the top section into folders below. Each folder will become a separate post.
        </div>
        <button 
          className="proceed-btn"
          onClick={onComplete}
          disabled={!canProceed()}
        >
          Create Posts ({folders.filter(f => f.images.length > 0).length})
        </button>
      </div>
    </div>
  );
};

export default FolderManager;