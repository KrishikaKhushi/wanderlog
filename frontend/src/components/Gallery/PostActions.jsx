// src/components/Gallery/PostActions.jsx
import React from "react";
import "./PostActions.css";

const PostActions = ({ 
  isLiked, 
  isSaved, 
  onLike, 
  onSave, 
  onToggleCaptionInput 
}) => {
  return (
    <div className="post-actions">
      <div className="action-left">
        <button 
          className={`action-btn like-btn ${isLiked ? 'liked' : ''}`} 
          onClick={onLike}
          title={isLiked ? "Unlike" : "Like"}
        >
          {isLiked ? '❤️' : '🤍'}
        </button>
        <button 
          className="action-btn comment-btn" 
          onClick={onToggleCaptionInput}
          title="Comment"
        >
          💬
        </button>
        <button className="action-btn share-btn" title="Share">
          📤
        </button>
      </div>
      <button 
        className={`action-btn save-btn ${isSaved ? 'saved' : ''}`} 
        onClick={onSave}
        title={isSaved ? "Remove from saved" : "Save"}
      >
        {isSaved ? '🔖' : '📋'}
      </button>
    </div>
  );
};

export default PostActions;