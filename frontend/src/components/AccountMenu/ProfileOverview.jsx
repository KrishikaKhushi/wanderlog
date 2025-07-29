import React from 'react';
import './ProfileOverview.css';

const ProfileOverview = ({ user, joinDate }) => {
  return (
    <section className="account-section">
      <h2>Profile Overview</h2>
      <div className="profile-summary">
        <div className="profile-avatar">
          {(user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U').toUpperCase()}
        </div>
        <div className="profile-info">
          <h3>{user?.fullName || user?.username || 'User'}</h3>
          <p>@{user?.username}</p>
          <p>Member since {joinDate}</p>
        </div>
      </div>
    </section>
  );
};

export default ProfileOverview;