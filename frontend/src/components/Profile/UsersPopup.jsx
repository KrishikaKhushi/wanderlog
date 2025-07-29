import React from 'react';
import { useNavigate } from "react-router-dom";
import './UsersPopup.css';

const UsersPopup = ({ 
  isOpen, 
  onClose, 
  title, 
  users, 
  loading, 
  onMessageUser,
  emptyMessage,
  emptyActionText,
  emptyActionHandler
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getDisplayName = (userData) => {
    if (!userData) return 'User';
    const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    return fullName || userData.username || 'User';
  };

  const getAvatarInitial = (userData) => {
    if (!userData) return 'U';
    const fullName = getDisplayName(userData);
    return fullName.charAt(0).toUpperCase();
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h3>{title}</h3>
          <button className="popup-close" onClick={onClose}>×</button>
        </div>
        <div className="popup-content">
          {loading ? (
            <div className="popup-loading">Loading...</div>
          ) : users.length > 0 ? (
            <div className="users-list">
              {users.map((user) => (
                <div key={user._id} className="user-item">
                  <div className="user-avatar-small">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" />
                    ) : (
                      <div className="avatar-placeholder-small">
                        {getAvatarInitial(user)}
                      </div>
                    )}
                  </div>
                  <div className="user-info-small">
                    <h4>{getDisplayName(user)}</h4>
                    <p>@{user.username}</p>
                  </div>
                  <button 
                    className="message-button-small"
                    onClick={() => onMessageUser(user)}
                  >
                    💬
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="popup-empty">
              <p>{emptyMessage}</p>
              {emptyActionText && emptyActionHandler && (
                <button 
                  className="explore-users-button"
                  onClick={() => {
                    onClose();
                    emptyActionHandler();
                  }}
                >
                  {emptyActionText}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPopup;