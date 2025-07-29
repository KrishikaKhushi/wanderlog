import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import ProfileOverview from "../components/AccountMenu/ProfileOverview";
import AccountInformation from "../components/AccountMenu/AccountInformation";
import SecuritySection from "../components/AccountMenu/SecuritySection";
import AppPreferences from "../components/AccountMenu/AppPreferences";
import DangerZone from "../components/AccountMenu/DangerZone";
import "./AccountPage.css";

const AccountPage = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  
  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  const [preferences, setPreferences] = useState({
    notifications: 'all',
    language: 'english',
    privacy: 'public',
    twoFactorEnabled: false
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [passwordReset, setPasswordReset] = useState({ loading: false, sent: false });

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setMessage({ type: '', text: '' });
  };

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Update profile information
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await API.put('/auth/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone
      });

      if (response.data.success) {
        updateUser(response.data.user);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    setPasswordReset({ loading: true, sent: false });
    
    try {
      await API.post('/auth/reset-password', { email: user.email });
      setPasswordReset({ loading: false, sent: true });
      setMessage({ type: 'success', text: 'Password reset email sent!' });
    } catch (error) {
      console.error('Password reset error:', error);
      setPasswordReset({ loading: false, sent: false });
      setMessage({ 
        type: 'error', 
        text: 'Failed to send password reset email' 
      });
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      setLoading(true);
      await API.delete('/auth/account');
      logout();
      navigate('/');
    } catch (error) {
      console.error('Account deletion error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to delete account. Please try again.' 
      });
      setLoading(false);
    }
    setShowDeleteConfirm(false);
  };

  // Get user's join date
  const getJoinDate = () => {
    if (user?.createdAt) {
      return new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'Unknown';
  };

  return (
    <div className="account-page">
      <div className="account-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← 
        </button>
        <h1>Account & Settings</h1>
      </div>

      <ProfileOverview 
        user={user}
        joinDate={getJoinDate()}
      />

      {/* Message Display */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <AccountInformation
        formData={formData}
        loading={loading}
        onInputChange={handleInputChange}
        onSubmit={handleUpdateProfile}
      />

      <SecuritySection
        passwordReset={passwordReset}
        onPasswordReset={handlePasswordReset}
      />

      <AppPreferences
        preferences={preferences}
        onPreferenceChange={handlePreferenceChange}
      />

      <DangerZone
        showDeleteConfirm={showDeleteConfirm}
        loading={loading}
        onDeleteAccount={handleDeleteAccount}
        onCancelDelete={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default AccountPage;