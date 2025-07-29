import React from 'react';
import './SecuritySection.css';

const SecuritySection = ({ passwordReset, onPasswordReset }) => {
  return (
    <section className="account-section">
      <h2>Security</h2>
      <div className="setting-item">
        <label>Password</label>
        <button 
          type="button"
          className="setting-button"
          onClick={onPasswordReset}
          disabled={passwordReset.loading}
        >
          {passwordReset.loading ? 'Sending...' : 
           passwordReset.sent ? 'Email Sent!' : 'Send Reset Email'}
        </button>
        <small>We'll send a password reset link to your email</small>
      </div>

      <div className="setting-item">
        <label>Two-Factor Authentication</label>
        <button className="setting-button disabled" disabled>
          Enable 2FA (Coming Soon)
        </button>
        <small>Add an extra layer of security to your account</small>
      </div>
    </section>
  );
};

export default SecuritySection;