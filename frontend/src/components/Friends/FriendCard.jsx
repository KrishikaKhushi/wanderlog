import React from 'react';
import { useNavigate } from "react-router-dom";
import './FriendCard.css';

const FriendCard = ({ friend, onMessageClick }) => {
  const navigate = useNavigate();

  const getDisplayName = (friend) => {
    const fullName = `${friend.firstName || ''} ${friend.lastName || ''}`.trim();
    return fullName || friend.username || 'User';
  };

  const getAvatarInitial = (friend) => {
    const displayName = getDisplayName(friend);
    return displayName.charAt(0).toUpperCase();
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  return (
    <div className="friend-card">
      <div className="friend-info" onClick={() => navigate(`/user/${friend.username}`)}>
        <div className="friend-avatar-container">
          {friend.profilePicture ? (
            <img src={friend.profilePicture} alt="Profile" className="friend-avatar" />
          ) : (
            <div className="friend-avatar-placeholder">
              {getAvatarInitial(friend)}
            </div>
          )}
          {friend.isOnline && <div className="online-indicator"></div>}
        </div>
        
        <div className="friend-details">
          <div className="friend-name-row">
            <h3 className="friend-name">{getDisplayName(friend)}</h3>
            <span className="last-message-time">{formatTime(friend.lastMessageTime)}</span>
          </div>
          <p className="friend-username">@{friend.username}</p>
          <p className="last-message">
            {friend.lastMessage || 'No messages yet'}
          </p>
        </div>
      </div>
      
      <div className="friend-actions">
        {friend.unreadCount > 0 && (
          <div className="unread-badge">{friend.unreadCount}</div>
        )}
        <button 
          className="message-button"
          onClick={() => onMessageClick(friend)}
          title="Send message"
        >
          💬
        </button>
      </div>
    </div>
  );
};

export default FriendCard;