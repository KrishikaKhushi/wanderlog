import React from 'react';
import './ProfileAvatar.css';

const ProfileAvatar = ({ 
  profilePicture, 
  firstName, 
  lastName, 
  username, 
  size = 'large',
  className = '',
  onClick 
}) => {
  const getAvatarInitial = () => {
    const fullName = `${firstName || ''} ${lastName || ''}`.trim();
    const displayName = fullName || username || 'User';
    return displayName.charAt(0).toUpperCase();
  };

  const sizeClass = `profile-avatar-${size}`;

  return (
    <div 
      className={`profile-pic-container ${sizeClass} ${className}`}
      onClick={onClick}
    >
      {profilePicture ? (
        <img 
          src={profilePicture} 
          alt="Profile" 
          className="profile-pic" 
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div 
        className={`profile-pic-placeholder ${profilePicture ? 'hidden' : ''}`}
        style={{ display: profilePicture ? 'none' : 'flex' }}
      >
        {getAvatarInitial()}
      </div>
    </div>
  );
};

export default ProfileAvatar;