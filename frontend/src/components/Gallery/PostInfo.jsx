// src/components/Gallery/PostInfo.jsx
import React from "react";
import "./PostInfo.css";

const PostInfo = ({ isLiked, postCaption, postData }) => {
  const displayCaption = postCaption || postData?.caption || "Beautiful memories from my travels! ✨ #wanderlust #memories";
  const likesCount = isLiked 
    ? (postData?.likes || Math.floor(Math.random() * 100)) + 1 
    : (postData?.likes || Math.floor(Math.random() * 100));
  const commentsCount = postData?.comments || Math.floor(Math.random() * 50);

  return (
    <div className="post-info">
      <div className="likes-count">
        <strong>{likesCount} likes</strong>
      </div>
      
      <div className="post-caption">
        <span className="username">your_username</span>
        <span className="caption-text">{displayCaption}</span>
      </div>
      
      {postData?.taggedPeople && postData.taggedPeople.length > 0 && (
        <div className="tagged-people-display">
          {postData.taggedPeople.map((person, index) => (
            <span key={index} className="tagged-person">@{person} </span>
          ))}
        </div>
      )}
      
      {postData?.location && (
        <div className="post-location">
          📍 {postData.location}
        </div>
      )}
      
      <div className="view-comments">
        View all {commentsCount} comments
      </div>
      
      <div className="recent-comment">
        <span className="username">friend_username</span>
        <span>Amazing shot! 🔥</span>
      </div>
      
      <div className="post-time">
        {postData?.timestamp 
          ? formatTimeAgo(postData.timestamp)
          : `${Math.floor(Math.random() * 24)} hours ago`
        }
      </div>
    </div>
  );
};

// Helper function to format time ago
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffInMs = now - postTime;
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  }
};

export default PostInfo;