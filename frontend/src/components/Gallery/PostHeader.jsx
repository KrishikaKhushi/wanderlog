// src/components/Gallery/PostHeader.jsx
import React from "react";
import "./PostHeader.css";

const PostHeader = ({ onClose }) => {
  return (
    <div className="post-header">
      <div className="user-info">
        <div className="user-avatar">👤</div>
        <div className="user-details">
          <span className="username">your_username</span>
          <span className="location">📍 Your Location</span>
        </div>
      </div>
      <div className="header-actions">
        <button className="more-options">⋯</button>
        <button className="post-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default PostHeader;