import React from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import './UserCard.css';

const UserCard = ({ userData, isExploring, onExplore, onAvatarClick }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const isOwnCard = currentUser?._id === userData._id;

  const getDisplayName = (user) => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.username || 'User';
  };

  const getAvatarInitial = (user) => {
    const displayName = getDisplayName(user);
    return displayName.charAt(0).toUpperCase();
  };

  const handleCardClick = () => {
    if (isOwnCard) {
      navigate('/my-profile');
    } else {
      navigate(`/user/${userData.username}`);
    }
  };

  const handleExploreClick = (e) => {
    e.stopPropagation(); // Prevent card click
    
    if (isOwnCard) {
      // If it's user's own card, just navigate to social (no explore action)
      navigate('/social');
    } else {
      onExplore(userData._id);
    }
  };

  const handleAvatarClick = (e) => {
    e.stopPropagation(); // Prevent card click
    onAvatarClick(userData);
  };

  return (
    <div className={`user-card ${isOwnCard ? 'own-card' : ''}`} onClick={handleCardClick}>
      <div className="user-avatar-container" onClick={handleAvatarClick}>
        {userData.profilePicture ? (
          <img src={userData.profilePicture} alt="Profile" className="user-avatar" />
        ) : (
          <div className="user-avatar-placeholder">
            {getAvatarInitial(userData)}
          </div>
        )}
      </div>
      
      <div className="card-user-info">
        {/* Changed from h3 to div to avoid default browser heading margins */}
        <div className="card-user-name">
          {getDisplayName(userData)} {isOwnCard && <span className="you-indicator">(You)</span>}
        </div>
        {/* Changed from p to div to avoid default browser paragraph margins */}
        <div className="card-user-username">@{userData.username}</div>
        
        <div className="user-stats">
          <span><strong>{userData.explorers || 0}</strong> followers</span>
          <span><strong>{userData.exploring || 0}</strong> following</span>
        </div>
      </div>
      
      <button 
        className={`explore-button ${isOwnCard ? 'own-profile' : (isExploring ? 'exploring' : '')}`}
        onClick={handleExploreClick}
      >
        {isOwnCard ? 'View Profile' : (isExploring ? 'Exploring' : 'Explore')}
      </button>
    </div>
  );
};

export default UserCard;