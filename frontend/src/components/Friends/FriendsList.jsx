import React from 'react';
import { useNavigate } from "react-router-dom";
import FriendCard from './FriendCard';
import './FriendsList.css';

const FriendsList = ({ friends, loading, error, searchTerm, onMessageClick }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your friends...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="no-friends">
        <div className="no-friends-icon">👥</div>
        {searchTerm ? (
          <>
            <h3>No friends found</h3>
            <p>No friends match your search "{searchTerm}"</p>
          </>
        ) : (
          <>
            <h3>No mutual friends yet</h3>
            <p>You don't have any mutual connections yet. Start exploring and connecting with other travelers!</p>
            <div className="friends-help-text">
              <strong>How to make friends:</strong><br />
              1. Go to Social page and explore other users<br />
              2. When someone explores you back, they become a friend<br />
              3. Friends who follow each other will appear here
            </div>
            <button 
              className="explore-button"
              onClick={() => navigate('/social')}
            >
              Discover Explorers
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="friends-list">
      {friends.map((friend) => (
        <FriendCard
          key={friend._id}
          friend={friend}
          onMessageClick={onMessageClick}
        />
      ))}
    </div>
  );
};

export default FriendsList;