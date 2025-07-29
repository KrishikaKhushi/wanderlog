import React from 'react';
import { FaUserCircle, FaMapPin } from 'react-icons/fa';
import './ControlButtons.css';

const ControlButtons = ({ activePanel, setActivePanel }) => {
  return (
    <div className="control-buttons">
      <button
        onClick={() => setActivePanel(prev => (prev === 'profile' ? null : 'profile'))}
        className="globe-icon-button"
        title="My Profile"
      >
        <FaUserCircle />
      </button>

      <button
        onClick={() => setActivePanel(prev => (prev === 'pin' ? null : 'pin'))}
        className="globe-icon-button"
        title="Pin Placement"
      >
        <FaMapPin />
      </button>
    </div>
  );
};

export default ControlButtons;