import React from 'react';
import './ProfileInfo.css';

const ProfileInfo = ({ 
  profileData, 
  location, 
  getDisplayName 
}) => {
  return (
    <div className="profile-text">
      <h2 className="profile-name">{getDisplayName()}</h2>
      <p className="profile-username">@{profileData.username}</p>
      
      {profileData.bio && (
        <div className="profile-bio-section">
          <p className="profile-bio">{profileData.bio}</p>
        </div>
      )}
      
      <div className="profile-details">
        <p className="profile-location">📍 {location}</p>
        
        {profileData.email && (
          <p className="profile-email">✉️ {profileData.email}</p>
        )}
        
        {profileData.phone && (
          <p className="profile-phone">📞 {profileData.phone}</p>
        )}
        
        {profileData.createdAt && (
          <p className="profile-joined">
            🗓️ Joined {new Date(profileData.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long'
            })}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;