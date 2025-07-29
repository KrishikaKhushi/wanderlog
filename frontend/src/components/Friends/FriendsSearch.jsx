import React from 'react';
import './FriendsSearch.css';

const FriendsSearch = ({ searchTerm, onSearchChange, friendsCount }) => {
  return (
    <div className="search-section">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search friends..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
      <p className="friends-count">{friendsCount} mutual connections</p>
    </div>
  );
};

export default FriendsSearch;