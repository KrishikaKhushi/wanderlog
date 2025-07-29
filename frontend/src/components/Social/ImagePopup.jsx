import React from 'react';
import './ImagePopup.css';

const ImagePopup = ({ isOpen, user, onClose }) => {
  if (!isOpen || !user) return null;

  const getDisplayName = (user) => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.username || 'User';
  };

  const getAvatarInitial = (user) => {
    const displayName = getDisplayName(user);
    return displayName.charAt(0).toUpperCase();
  };

  return (
    <div className="image-popup-overlay" onClick={onClose}>
      <div className="image-popup" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>×</button>
        <div className="popup-content">
          {user.profilePicture ? (
            <img 
              src={user.profilePicture} 
              alt={`${getDisplayName(user)}'s profile`}
              className="popup-image"
            />
          ) : (
            <div className="popup-avatar-placeholder">
              {getAvatarInitial(user)}
            </div>
          )}
          <div className="popup-user-info">
            <h3>{getDisplayName(user)}</h3>
            <p>@{user.username}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePopup;