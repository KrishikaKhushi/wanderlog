import React from 'react';
import './SocialSearch.css';

const SocialSearch = ({ searchTerm, onSearchChange, usersCount }) => {
  return (
    <div className="search-section">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search explorers..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
      <p className="users-count">{usersCount} explorers found</p>
    </div>
  );
};

export default SocialSearch;