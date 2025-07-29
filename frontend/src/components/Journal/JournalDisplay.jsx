// src/components/Journal/JournalDisplay.jsx
import React from "react";
import JournalEntry from "./JournalEntry";
import TypingCursor from "./TypingCursor";
import "./JournalDisplay.css";

const JournalDisplay = ({
  displayedEntries,
  isTyping,
  onEditEntry,
  onDeleteEntry,
  onWriteEntryClick,
}) => {
  return (
    <div className="journal-display">
      <div className="journal-scroll-container">
        {displayedEntries.map((entry, index) => (
          <JournalEntry
            key={`${entry.date}-${index}`} // Use date + index for stable keys
            entry={entry}
            index={index}
            onEditEntry={onEditEntry}
            onDeleteEntry={onDeleteEntry}
          />
        ))}
        {isTyping && <TypingCursor />}
      </div>

      <button className="edit-journal-button" onClick={onWriteEntryClick}>
        Write New Entry
      </button>
    </div>
  );
};

export default JournalDisplay;