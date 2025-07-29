// src/components/Gallery/CaptionForm.jsx
import React from "react";
import "./CaptionForm.css";

const CaptionForm = ({ postCaption, setPostCaption, onSubmit }) => {
  return (
    <div className="caption-section">
      <form onSubmit={onSubmit} className="caption-form">
        <div className="comment-avatar">😊</div>
        <input
          type="text"
          value={postCaption}
          onChange={(e) => setPostCaption(e.target.value)}
          placeholder="Add a comment..."
          className="caption-input"
          autoFocus
        />
        <button 
          type="submit" 
          className="caption-submit"
          disabled={!postCaption.trim()}
        >
          Post
        </button>
      </form>
    </div>
  );
};

export default CaptionForm;