import React from 'react';
import { useNavigate } from "react-router-dom";
import './ProfileHeader.css';

const ProfileHeader = ({ title = "My Profile", showBackButton = true, customBackClass = "" }) => {
  const navigate = useNavigate();

  return (
    <div className="profile-header">
      {showBackButton && (
        <button 
          className={`back-button customizable-back-button ${customBackClass}`}
          onClick={() => navigate(-1)}
          title="Go back"
        >
          ←
        </button>
      )}
      <h1>{title}</h1>
    </div>
  );
};

export default ProfileHeader;