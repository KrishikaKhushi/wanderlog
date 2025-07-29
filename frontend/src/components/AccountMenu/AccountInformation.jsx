import React from 'react';
import './AccountInformation.css';

const AccountInformation = ({ formData, loading, onInputChange, onSubmit }) => {
  return (
    <section className="account-section">
      <h2>Account Information</h2>
      <form onSubmit={onSubmit}>
        <div className="setting-item">
          <label>First Name</label>
          <input 
            type="text" 
            name="firstName"
            value={formData.firstName}
            onChange={onInputChange}
            placeholder="Enter your first name"
          />
        </div>

        <div className="setting-item">
          <label>Last Name</label>
          <input 
            type="text" 
            name="lastName"
            value={formData.lastName}
            onChange={onInputChange}
            placeholder="Enter your last name"
          />
        </div>

        <div className="setting-item">
          <label>Email Address</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={onInputChange}
            placeholder="Enter your email address"
          />
        </div>

        <div className="setting-item">
          <label>Phone Number</label>
          <input 
            type="tel" 
            name="phone"
            value={formData.phone}
            onChange={onInputChange}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <button 
          type="submit" 
          className="setting-button update-button"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </section>
  );
};

export default AccountInformation;