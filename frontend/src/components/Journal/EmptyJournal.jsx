// src/components/Journal/EmptyJournal.jsx
import React from "react";
import "./EmptyJournal.css";

const EmptyJournal = ({ onWriteEntryClick }) => {
  return (
    <div className="empty-journal">
      <p className="empty-message">Your journal is empty</p>
      <p className="empty-subtitle">Start documenting your travel memories!</p>
      <button className="write-entry-button" onClick={onWriteEntryClick}>
        Write Your First Entry
      </button>
    </div>
  );
};

export default EmptyJournal;