import React from 'react';
import './DangerZone.css';

const DangerZone = ({ showDeleteConfirm, loading, onDeleteAccount, onCancelDelete }) => {
  return (
    <section className="account-section danger-section">
      <h2>Danger Zone</h2>
      <div className="setting-item danger">
        <label>Delete Account</label>
        <div className="delete-section">
          {!showDeleteConfirm ? (
            <button 
              className="delete-button"
              onClick={onDeleteAccount}
            >
              Delete Account
            </button>
          ) : (
            <div className="delete-confirm">
              <p>⚠️ This action cannot be undone. All your data will be permanently deleted.</p>
              <div className="confirm-buttons">
                <button 
                  className="delete-button confirm"
                  onClick={onDeleteAccount}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Yes, Delete My Account'}
                </button>
                <button 
                  className="setting-button"
                  onClick={onCancelDelete}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        <small>This will permanently delete your account and all travel data</small>
      </div>
    </section>
  );
};

export default DangerZone;