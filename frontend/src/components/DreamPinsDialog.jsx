// src/components/DreamPinsDialog.jsx
import React from "react";
import "./DreamPinsDialog.css";

const DreamPinsDialog = ({ pins, onClose }) => {
  return (
    <div className="dream-dialog-overlay" onClick={onClose}>
      <div className="dream-dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Dream Pins</h2>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        {pins.length > 0 ? (
          <ul className="pin-list">
            {pins.map((pin, index) => (
              <li key={index}>
                <span role="img" aria-label="pin">📍</span> {pin.country}
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-pins">No dream pins yet. 🌙</p>
        )}
      </div>
    </div>
  );
};

export default DreamPinsDialog;
