import React from 'react';
import './ImageUploadField.css';

const ImageUploadField = ({ profilePicture, onImageSelect }) => {
  return (
    <div className="form-group">
      <label>Profile Picture</label>
      <div className="file-upload-container">
        <button 
          type="button"
          className="file-upload-label"
          onClick={onImageSelect}
        >
          {profilePicture ? 'Change Picture' : 'Choose Picture'}
        </button>
        {profilePicture && (
          <span className="file-name">{profilePicture.name}</span>
        )}
      </div>
      <small>Maximum file size: 5MB. Supported formats: JPG, PNG, GIF</small>
    </div>
  );
};

export default ImageUploadField;