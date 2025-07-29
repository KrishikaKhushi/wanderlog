// src/components/Journal/JournalEntry.jsx
import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./JournalEntry.css";

const JournalEntry = ({ entry, index, onEditEntry, onDeleteEntry }) => {
  return (
    <React.Fragment>
      <div className="entry-meta">
        <span className="entry-date">
          {new Date(entry.date).toLocaleString()}
        </span>
        <div className="entry-actions">
          <FaEdit
            className="entry-icon edit-icon"
            title="Edit"
            onClick={() => onEditEntry(index)}
          />
          <FaTrash
            className="entry-icon delete-icon"
            title="Delete"
            onClick={() => onDeleteEntry(index)}
          />
        </div>
      </div>
      <p className="entry-text">{entry.text}</p>
    </React.Fragment>
  );
};

export default JournalEntry;