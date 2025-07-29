import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Import existing components
import ProfileHeader from "../components/Profile/ProfileHeader";
import ProfileStats from "../components/Profile/ProfileStats";
import ProfileActions from "../components/Profile/ProfileActions";
import UsersPopup from "../components/Profile/UsersPopup";
import ChatModal from "../components/Friends/ChatModal";

// Import new components
import ProfileAvatar from "../components/Profile/ProfileAvatar";
import ProfileInfo from "../components/Profile/ProfileInfo";

// Import services
import { useLocation } from "../components/Profile/Service/LocationService";
import { useUserStats } from "../components/Profile/Service/UserStatsService";
import { useMessages } from "../components/Profile/Service/MessageService";

import "./MyProfile.css";

const MyProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use custom hooks
  const { location } = useLocation();
  const {
    stats,
    explorersList,
    exploringList,
    loading: statsLoading,
    fetchExplorersList,
    fetchExploringList
  } = useUserStats(user);
  
  const {
    messages,
    sending: sendingMessage,
    loadMessages,
    loadSelfMessages,
    sendMessage,
    clearMessages
  } = useMessages(user);
  
  // Local state
  const [profileData, setProfileData] = useState(null);
  
  // Popup states
  const [showExplorersPopup, setShowExplorersPopup] = useState(false);
  const [showExploringPopup, setShowExploringPopup] = useState(false);
  
  // Message states
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState(null);

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setProfileData(user);
    }
  }, [user]);

  // Handle explorers popup
  const handleExplorersClick = () => {
    setShowExplorersPopup(true);
    fetchExplorersList();
  };

  // Handle exploring popup
  const handleExploringClick = () => {
    setShowExploringPopup(true);
    fetchExploringList();
  };

  // Handle message user
  const handleMessageUser = async (userData) => {
    setMessageRecipient(userData);
    setShowMessageModal(true);
    
    // Clear previous messages
    clearMessages();
    
    if (userData._id === user._id) {
      // Load self messages
      await loadSelfMessages();
    } else {
      // Load conversation with other user
      await loadMessages(userData._id);
    }
  };

  // Handle send message
  const handleSendMessage = async (messageText) => {
    if (!messageRecipient) return;
    
    await sendMessage(messageRecipient._id, messageText);
  };

  // Utility functions
  const getDisplayName = (userData = profileData) => {
    if (!userData) return 'User';
    const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    return fullName || userData.username || 'User';
  };

  const getAvatarInitial = (userData = profileData) => {
    if (!userData) return 'U';
    const fullName = getDisplayName(userData);
    return fullName.charAt(0).toUpperCase();
  };

  // Handle visit globe
  const handleVisitGlobe = () => {
    navigate('/');
  };

  // Close all popups and modals
  const closeAllPopups = () => {
    setShowExplorersPopup(false);
    setShowExploringPopup(false);
    setShowMessageModal(false);
    setMessageRecipient(null);
    clearMessages();
  };

  // Loading state
  if (!profileData) {
    return (
      <div className="my-profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-profile-page">
      {/* Back Button - ORIGINAL */}
      <button className="back-button" onClick={() => navigate(-1)}>
        ←
      </button>

      <div className="my-profile-content">
        <div className="profile-text">
          <h2 className="profile-name">{getDisplayName()}</h2>
          
          <ProfileStats 
            stats={stats}
            onExplorersClick={handleExplorersClick}
            onExploringClick={handleExploringClick}
            loading={statsLoading}
          />
          
          <p className="profile-username">@{profileData.username}</p>
          {profileData.bio && <p className="profile-bio">{profileData.bio}</p>}
          <p className="profile-location">📍 {location}</p>

          <ProfileActions 
            isOwnProfile={true}
            profileData={profileData}
            isExploring={false}
            onExplore={() => navigate('/social')}
            onMessage={handleMessageUser}
          />
        </div>

        <div className="profile-pic-container">
          {profileData.profilePicture ? (
            <img src={profileData.profilePicture} alt="Profile" className="profile-pic" />
          ) : (
            <div className="profile-pic-placeholder">
              {getAvatarInitial()}
            </div>
          )}
        </div>
      </div>
      
      <div className="visit-globe-button-container">
        <button className="visit-globe-button" onClick={handleVisitGlobe}>
          Visit {profileData.username}'s Globe
        </button>
      </div>

      {/* Explorers Popup */}
      <UsersPopup
        isOpen={showExplorersPopup}
        onClose={closeAllPopups}
        title={`Your Explorers (${stats.explorers})`}
        users={explorersList}
        loading={statsLoading}
        onMessageUser={handleMessageUser}
        emptyMessage="No explorers yet! Share your profile with others to get explorers."
      />

      {/* Exploring Popup */}
      <UsersPopup
        isOpen={showExploringPopup}
        onClose={closeAllPopups}
        title={`You're Exploring (${stats.exploring})`}
        users={exploringList}
        loading={statsLoading}
        onMessageUser={handleMessageUser}
        emptyMessage="You're not exploring anyone yet!"
        emptyActionText="Discover Users"
        emptyActionHandler={() => navigate('/social')}
      />

      {/* Message Modal */}
      <ChatModal
        isOpen={showMessageModal}
        onClose={closeAllPopups}
        selectedFriend={messageRecipient}
        messages={messages}
        onSendMessage={handleSendMessage}
        sendingMessage={sendingMessage}
      />
    </div>
  );
};

export default MyProfile;