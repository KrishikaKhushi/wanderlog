import React from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import './ProfileActions.css';

const ProfileActions = ({ 
  isOwnProfile = true, 
  profileData = null, 
  isExploring = false, 
  onExplore = null, 
  onMessage = null 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleExplore = () => {
    if (isOwnProfile) {
      navigate('/social');
    } else if (onExplore) {
      onExplore();
    }
  };

  const handleMessage = () => {
    if (isOwnProfile) {
      // Self message - open chat modal with self
      if (onMessage && user) {
        onMessage(user); // Pass current user as the recipient for self-message
      }
    } else if (onMessage && profileData) {
      // Message another user
      onMessage(profileData);
    }
  };

  return (
    <div className="profile-actions">
      <button className="profile-action-button" onClick={handleExplore}>
        <img src="https://img.icons8.com/?size=100&id=62888&format=png&color=000000" alt="Explore" />
        {isOwnProfile ? 'Explore' : (isExploring ? 'Exploring' : 'Explore')}
      </button>
      <button className="profile-action-button" onClick={handleMessage}>
        <img src="https://img.icons8.com/?size=100&id=38977&format=png&color=000000" alt="Message" />
        Message
      </button>
      <button className="profile-action-button" style={{ opacity: 0.6 }} title="Coming soon!">
        <img src="https://img.icons8.com/?size=100&id=5465&format=png&color=000000" alt="Invite" />
        Invite
      </button>
    </div>
  );
};

export default ProfileActions;