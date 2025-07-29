// src/components/VisitedPinsDialog.jsx
import React from "react";
import "./VisitedPinsDialog.css";

const VisitedPinsDialog = ({ pins, onClose }) => {
  const visitedPins = pins.filter(pin => pin.type === 'visited');

  return (
    <div className="visited-dialog-overlay" onClick={onClose}>
      <div className="visited-dialog" onClick={e => e.stopPropagation()}>
        <div className="visited-dialog-header">
          <h2>Visited Countries</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <ul className="visited-country-list">
          {visitedPins.length > 0 ? (
            visitedPins.map(pin => (
              <li key={pin.id}>{pin.country}</li>
            ))
          ) : (
            <p className="no-visits">You haven’t added any visited countries yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default VisitedPinsDialog;
