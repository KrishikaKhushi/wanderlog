// src/components/Journal/EntryForm.jsx
import React from "react";
import "./EntryForm.css";

const EntryForm = ({
  entry,
  setEntry,
  editingIndex,
  onSaveEntry,
  onCancelEntry,
}) => {
  return (
    <div className="entry-section">
      <form onSubmit={onSaveEntry} className="entry-form">
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="What did you do, see, or love?"
          className="entry-textarea"
          required
        />
        <div className="entry-buttons">
          <button type="submit" className="save-entry-button">
            {editingIndex !== null ? "Update Entry" : "Save Entry"}
          </button>
          <button
            type="button"
            className="cancel-entry-button"
            onClick={onCancelEntry}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EntryForm;