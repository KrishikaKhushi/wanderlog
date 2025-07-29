// src/components/Journal/EntryPopup.jsx
import React from "react";
import { FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import "./EntryPopup.css";

const EntryPopup = ({ entry, index, isOpen, onClose, onEdit, onDelete }) => {
  if (!isOpen || !entry) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEdit = () => {
    onEdit(index);
    onClose();
  };

  const handleDelete = () => {
    onDelete(index);
    onClose();
  };

  return (
    <div className="entry-popup-backdrop" onClick={handleBackdropClick}>
      <div className="entry-popup">
        <div className="entry-popup-header">
          <div className="entry-popup-date">
            {new Date(entry.date).toLocaleString()}
          </div>
          <div className="entry-popup-actions">
            <FaEdit
              className="entry-popup-icon edit-icon"
              title="Edit Entry"
              onClick={handleEdit}
            />
            <FaTrash
              className="entry-popup-icon delete-icon"
              title="Delete Entry"
              onClick={handleDelete}
            />
            <FaTimes
              className="entry-popup-icon close-icon"
              title="Close"
              onClick={onClose}
            />
          </div>
        </div>
        
        <div className="entry-popup-content">
          <p className="entry-popup-text">{entry.text}</p>
        </div>
      </div>
    </div>
  );
};

export default EntryPopup;