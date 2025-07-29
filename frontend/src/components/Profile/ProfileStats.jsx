import React from 'react';
import './ProfileStats.css';

const ProfileStats = ({ 
  stats, 
  onExplorersClick, 
  onExploringClick, 
  isOwnProfile = true,
  profileData = null 
}) => {
  const handleExplorersClick = () => {
    if (onExplorersClick) {
      onExplorersClick(profileData);
    }
  };

  const handleExploringClick = () => {
    if (onExploringClick) {
      onExploringClick(profileData);
    }
  };

  return (
    <div className="explorer-counts">
      <span 
        className="explorer-count-item clickable"
        onClick={handleExplorersClick}
        title={isOwnProfile ? "View your explorers" : `View ${profileData?.username || 'user'}'s explorers`}
      >
        <strong>{stats.explorers}</strong> Explorers
      </span>
      <span 
        className="explorer-count-item clickable"
        onClick={handleExploringClick}
        title={isOwnProfile ? "View who you're exploring" : `View who ${profileData?.username || 'user'} is exploring`}
      >
        <strong>{stats.exploring}</strong> Exploring
      </span>
    </div>
  );
};

export default ProfileStats;