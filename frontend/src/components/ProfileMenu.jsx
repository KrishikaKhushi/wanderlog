import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import './ProfileMenu.css';

const ProfileMenu = ({ activePanel }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (activePanel !== 'profile') return null;

  const handleLogout = () => {
    console.log('👋 User logged out');
    logout();
    // No need to navigate, App.jsx will automatically show the cover page
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div
      className={`profile-slideout ${activePanel === 'profile' ? 'open' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="profile-content">
        {/* Top Section */}
        <div className="profile-header">
          <div
            className="username"
            onClick={() => navigate("/my-profile")}
            style={{ cursor: "pointer" }}
            title="View your profile"
          >
            {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'User'}
          </div>
          <div className="email">
            {user?.email || 'user@example.com'}
          </div>
          <div
            className="edit-profile"
            onClick={() => navigate("/edit-profile")}
            style={{ cursor: "pointer" }}
            title="Edit your profile"
          >
            <img
              src="https://img.icons8.com/?size=100&id=49&format=png&color=0080ff"
              alt="Edit Profile"
            />
            <span>Edit Profile</span>
          </div>
        </div>

        {/* Middle Options */}
        <div className="profile-options">
          <div
            className="option"
            onClick={() => navigate("/account")}
            style={{ cursor: "pointer" }}
            title="Manage your account settings"
          >
            <img
              src="https://img.icons8.com/?size=100&id=364&format=png&color=FFFFFF"
              alt="Accounts & Settings"
            />
            <span>Accounts & Settings</span>
          </div>
          
          <div 
            className="option"
            onClick={() => navigate("/social")}
            style={{ cursor: "pointer" }}
            title="Discover and connect with other explorers"
          >
            <img
              src="https://img.icons8.com/?size=100&id=123782&format=png&color=FFFFFF"
              alt="Social"
            />
            <span>Social</span>
          </div>
          
          <div 
            className="option"
            onClick={() => navigate("/friends")}
            style={{ cursor: "pointer" }}
            title="View and manage your friends"
          >
            <img
              src="https://img.icons8.com/?size=100&id=24871&format=png&color=FFFFFF"
              alt="My Friends"
            />
            <span>My Friends</span>
          </div>
          
          <div 
            className="option"
            style={{ cursor: "pointer", opacity: 0.6 }}
            title="Coming soon!"
          >
            <img
              src="https://img.icons8.com/?size=100&id=5465&format=png&color=FFFFFF"
              alt="Trip Invites"
            />
            <span>Trip Invites</span>
            <small style={{ fontSize: '0.7rem', color: '#999' }}>(Coming Soon)</small>
          </div>

          {/* Toggles + Logout */}
          <div className="toggle-and-logout">
            <div className="toggle-option">
              <label className="switch">
                <input 
                  type="checkbox" 
                  title="Make your travel map public or private"
                />
                <span className="slider round"></span>
              </label>
              <span>Public / Private Account</span>
            </div>
            
            <div className="toggle-option">
              <label className="switch">
                <input 
                  type="checkbox"
                  title="Switch between light and dark theme" 
                />
                <span className="slider round"></span>
              </label>
              <span>Light / Dark Mode</span>
            </div>

            {/* Logout Section */}
            {!showLogoutConfirm ? (
              <div 
                className="logout-option"
                onClick={confirmLogout}
                style={{ cursor: "pointer" }}
                title="Sign out of your account"
              >
                <img
                  src="https://img.icons8.com/?size=100&id=2445&format=png&color=ff2424"
                  alt="Logout"
                />
                <span>Logout</span>
              </div>
            ) : (
              <div className="logout-confirm">
                <div style={{ 
                  marginBottom: '0.5rem', 
                  fontSize: '0.9rem', 
                  color: '#333',
                  textAlign: 'center'
                }}>
                  Are you sure you want to logout?
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem',
                  justifyContent: 'center'
                }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      background: '#ff4444',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}
                  >
                    Yes, Logout
                  </button>
                  <button
                    onClick={cancelLogout}
                    style={{
                      background: '#666',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Info Footer */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '1rem',
          marginTop: '1rem',
          fontSize: '0.8rem',
          color: '#999',
          textAlign: 'center'
        }}>
          Logged in as: {user?.username}
          <br />
          <span style={{ fontSize: '0.7rem' }}>
            Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileMenu;