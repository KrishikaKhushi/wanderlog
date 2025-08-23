import React from 'react';
import UserCard from './UserCard';
import './UsersGrid.css';

const UsersGrid = ({ 
  users, 
  loading, 
  error, 
  exploring, 
  onExplore, 
  onAvatarClick,
  searchTerm 
}) => {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Discovering explorers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error} - Showing sample data
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="no-users">
        <p>No explorers found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="users-grid">
      {users.map((userData) => (
        <UserCard
          key={userData._id}
          userData={userData}
          isExploring={exploring.has(userData._id)}
          onExplore={onExplore}
          onAvatarClick={onAvatarClick}
        />
      ))}
    </div>
  );
};

export default UsersGrid;