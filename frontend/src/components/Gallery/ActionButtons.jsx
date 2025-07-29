// src/components/Gallery/ActionButtons.jsx
import React, { useState } from "react";
import UploadOrganizer from "./UploadOrganizer";
import "./ActionButtons.css";

const ActionButtons = ({ galleryView, onToggleView, onFileUpload, onPostsCreated, countryName }) => {
  const [showUploadOrganizer, setShowUploadOrganizer] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const fileToDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      // Convert files to data URLs (more stable than blob URLs)
      const fileDataPromises = files.map(async (file) => ({
        file: file,
        url: await fileToDataURL(file),
        name: file.name,
        size: file.size,
        type: file.type
      }));
      
      const fileData = await Promise.all(fileDataPromises);
      setSelectedFiles(fileData.map(data => data.url));
      setShowUploadOrganizer(true);
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Error processing selected files. Please try again.');
    }
    
    // Reset the input
    e.target.value = '';
  };

  const handlePostsCreated = (posts) => {
    if (onPostsCreated) {
      onPostsCreated(posts);
    }
    
    setSelectedFiles([]);
    setShowUploadOrganizer(false);
  };

  const handleOrganizerClose = () => {
    setSelectedFiles([]);
    setShowUploadOrganizer(false);
  };

  return (
    <>
      <div className="gallery-actions">
        <label className="circular-button upload-button" title="Upload Photos">
          +
          <input
            type="file"
            multiple
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
        </label>
        <button 
          className="circular-button view-button" 
          onClick={onToggleView}
          title={galleryView === "slideshow" ? "Switch to Grid View" : "Switch to Slideshow"}
        >
          {galleryView === "slideshow" ? "⊞" : "▶"}
        </button>
      </div>

      {showUploadOrganizer && (
        <UploadOrganizer
          selectedFiles={selectedFiles}
          onClose={handleOrganizerClose}
          onPost={handlePostsCreated}
          countryName={countryName} // ADD THIS LINE
        />
      )}
    </>
  );
};

export default ActionButtons;