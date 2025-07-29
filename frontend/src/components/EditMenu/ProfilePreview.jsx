import React from 'react';
import './ProfilePreview.css';

const ProfilePreview = ({ profilePicturePreview, displayName, username, location }) => {
  return (
    <div className="profile-preview">
      <div className="preview-avatar">
        {profilePicturePreview ? (
          <img src={profilePicturePreview} alt="Profile" />
        ) : (
          <div className="avatar-placeholder">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="preview-info">
        <h3>{displayName}</h3>
        <p>@{username}</p>
        <p className="location">📍 {location}</p>
      </div>
    </div>
  );
};

export default ProfilePreview;