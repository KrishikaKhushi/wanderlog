import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VisitedPinsDialog from "./VisitedPinsDialog";
import DreamPinsDialog from "./DreamPinsDialog";
import './MainLeftMenu.css';

const MainLeftMenu = ({ 
  menuOpen, 
  setMenuOpen, 
  pins 
}) => {
  const { user } = useAuth();
  const [showVisitedDialog, setShowVisitedDialog] = useState(false);
  const [showDreamDialog, setShowDreamDialog] = useState(false);
  const navigate = useNavigate();

  // Get user's first name or fallback to username
  const getDisplayName = () => {
    if (user?.firstName && user.firstName.trim()) {
      return user.firstName;
    } else if (user?.username) {
      return user.username;
    }
    return 'Traveler';
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get user's travel stats for display
  const visitedCount = pins?.filter(pin => pin.type === 'visited').length || 0;
  const dreamCount = pins?.filter(pin => pin.type === 'dream').length || 0;

  return (
    <>
      <button 
        className={`menu-toggle ${menuOpen ? 'open' : ''}`} 
        onClick={() => setMenuOpen(prev => !prev)}
        title={menuOpen ? 'Close menu' : 'Open menu'}
      >
        <img
          src={menuOpen
            ? 'https://img.icons8.com/?size=100&id=40217&format=png&color=AAAAAA' // Left-pointing
            : 'https://img.icons8.com/?size=100&id=7849&format=png&color=AAAAAA' // Right-pointing
          }
          alt="toggle menu"
        />
      </button>

      <div className={`sliding-menu ${menuOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <p className="hello">
            {getGreeting()}, {getDisplayName()}!
          </p>
          <p className="subtitle">Where are we going next?</p>
        </div>

        <ul className="menu-items">
          <li 
            onClick={() => setShowVisitedDialog(true)}
            title={`View your ${visitedCount} visited destinations`}
            style={{ position: 'relative' }}
          >
            <img 
              src="https://img.icons8.com/?size=100&id=7880&format=png&color=AAAAAA" 
              alt="Visited Pins" 
            />
            Visited Pins
            {visitedCount > 0 && (
              <span className="pin-count visited-count">{visitedCount}</span>
            )}
          </li>

          <li 
            onClick={() => setShowDreamDialog(true)}
            title={`View your ${dreamCount} dream destinations`}
            style={{ position: 'relative' }}
          >
            <img 
              src="https://img.icons8.com/?size=100&id=3723&format=png&color=AAAAAA" 
              alt="Dream Pins" 
            />
            Dream Pins
            {dreamCount > 0 && (
              <span className="pin-count dream-count">{dreamCount}</span>
            )}
          </li>

          <li 
            onClick={() => navigate('/explore')}
            title="Explore new destinations"
          >
            <img 
              src="https://img.icons8.com/?size=100&id=9672&format=png&color=AAAAAA" 
              alt="Explore" 
            />
            Explore
          </li>

          <li 
            onClick={() => navigate('/map')}
            title="View your travel map"
          >
            <img 
              src="https://img.icons8.com/?size=100&id=3723&format=png&color=AAAAAA" 
              alt="Map View" 
            />
            Map View
          </li>

          <li title="Get help and support">
            <img 
              src="https://img.icons8.com/?size=100&id=646&format=png&color=AAAAAA" 
              alt="Help" 
            />
            Help
          </li>
        </ul>

        {/* User Info Footer */}
        <div className="menu-footer">
          <div className="user-info">
            <div className="user-avatar">
              {getDisplayName().charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{getDisplayName()}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog Components */}
      {showVisitedDialog && (
        <VisitedPinsDialog 
          pins={pins?.filter(pin => pin.type === 'visited') || []} 
          onClose={() => setShowVisitedDialog(false)} 
        />
      )}
      {showDreamDialog && (
        <DreamPinsDialog
          pins={pins?.filter(pin => pin.type === 'dream') || []}
          onClose={() => setShowDreamDialog(false)}
          title="Dream Pins"
        />
      )}
    </>
  );
};

export default MainLeftMenu;