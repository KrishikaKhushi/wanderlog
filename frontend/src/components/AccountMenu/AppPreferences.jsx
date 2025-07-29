import React from 'react';
import './AppPreferences.css';

const AppPreferences = ({ preferences, onPreferenceChange }) => {
  return (
    <section className="account-section">
      <h2>App Preferences</h2>
      <div className="setting-item">
        <label>Notifications</label>
        <select 
          name="notifications"
          value={preferences.notifications}
          onChange={onPreferenceChange}
        >
          <option value="all">All Notifications</option>
          <option value="important">Only Important</option>
          <option value="none">None</option>
        </select>
      </div>

      <div className="setting-item">
        <label>Language</label>
        <select 
          name="language"
          value={preferences.language}
          onChange={onPreferenceChange}
        >
          <option value="english">English</option>
          <option value="hindi">हिन्दी (Hindi)</option>
          <option value="spanish">Español (Spanish)</option>
        </select>
      </div>

      <div className="setting-item">
        <label>Privacy Settings</label>
        <select 
          name="privacy"
          value={preferences.privacy}
          onChange={onPreferenceChange}
        >
          <option value="public">Public Profile</option>
          <option value="private">Private Profile</option>
        </select>
        <small>Control who can see your travel map</small>
      </div>

      <div className="setting-item">
        <label>Social Accounts</label>
        <div className="linked-accounts">
          <button className="setting-button disabled" disabled>
            Link Google (Coming Soon)
          </button>
          <button className="setting-button disabled" disabled>
            Link Facebook (Coming Soon)
          </button>
        </div>
      </div>
    </section>
  );
};

export default AppPreferences;