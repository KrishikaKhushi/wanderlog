import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";

// Import components
import ProfileHeader from "../components/Profile/ProfileHeader";
import ProfileStats from "../components/Profile/ProfileStats";
import ProfileActions from "../components/Profile/ProfileActions";
import UsersPopup from "../components/Profile/UsersPopup";
import ChatModal from "../components/Friends/ChatModal";

import "./MyProfile.css"; // Reuse the same styles

const UserProfile = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExploring, setIsExploring] = useState(false);
  const [stats, setStats] = useState({ explorers: 0, exploring: 0 });
  
  // Popup states
  const [showExplorersPopup, setShowExplorersPopup] = useState(false);
  const [showExploringPopup, setShowExploringPopup] = useState(false);
  const [explorersList, setExplorersList] = useState([]);
  const [exploringList, setExploringList] = useState([]);
  const [popupLoading, setPopupLoading] = useState(false);
  
  // Message states
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sendingMessage, setSendingMessage] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    fetchUserProfile();
    if (!isOwnProfile) {
      checkExploringStatus();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      console.log('Fetching profile for:', username);
      const response = await API.get(`/users/${username}`);
      
      if (response.data.success) {
        const userData = response.data.user;
        setProfileData(userData);
        setStats({
          explorers: userData.explorers || 0,
          exploring: userData.exploring || 0
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkExploringStatus = async () => {
    try {
      const response = await API.get('/users/exploring');
      if (response.data.success) {
        const exploringUsernames = response.data.exploring.map(user => user.username);
        setIsExploring(exploringUsernames.includes(username));
      }
    } catch (error) {
      console.error('Error checking exploring status:', error);
    }
  };

  // Fetch explorers list for any user
  const fetchExplorersList = async (userData) => {
    try {
      setPopupLoading(true);
      console.log('👥 Fetching explorers list for:', userData?.username);
      
      const targetUsername = userData?.username || username;
      const response = await API.get(`/users/${targetUsername}/explorers`);
      
      if (response.data.success) {
        setExplorersList(response.data.explorers || []);
        console.log('📊 Explorers list loaded:', response.data.explorers.length);
      } else {
        throw new Error('Failed to fetch explorers');
      }
    } catch (error) {
      console.error('❌ Error fetching explorers:', error);
      setExplorersList([]);
    } finally {
      setPopupLoading(false);
    }
  };

  // Fetch exploring list for any user
  const fetchExploringList = async (userData) => {
    try {
      setPopupLoading(true);
      console.log('👥 Fetching exploring list for:', userData?.username);
      
      const targetUsername = userData?.username || username;
      const response = await API.get(`/users/${targetUsername}/exploring`);
      
      if (response.data.success) {
        setExploringList(response.data.exploring || []);
        console.log('📊 Exploring list loaded:', response.data.exploring.length);
      }
    } catch (error) {
      console.error('❌ Error fetching exploring list:', error);
      setExploringList([]);
    } finally {
      setPopupLoading(false);
    }
  };

  // Handle explorers popup
  const handleExplorersClick = (userData = profileData) => {
    setShowExplorersPopup(true);
    fetchExplorersList(userData);
  };

  // Handle exploring popup
  const handleExploringClick = (userData = profileData) => {
    setShowExploringPopup(true);
    fetchExploringList(userData);
  };

  const handleExplore = async () => {
    if (isOwnProfile) {
      navigate('/social');
      return;
    }

    try {
      const endpoint = isExploring ? '/users/unexplore' : '/users/explore';
      const response = await API.post(endpoint, { userId: profileData._id });
      
      if (response.data.success) {
        setIsExploring(!isExploring);
        
        // Update explorer count in UI
        setStats(prev => ({
          ...prev,
          explorers: isExploring 
            ? Math.max(0, prev.explorers - 1)
            : prev.explorers + 1
        }));
      }
    } catch (error) {
      console.error('Error updating explore status:', error);
    }
  };

  // Handle message user
  const handleMessageUser = (userData) => {
    setMessageRecipient(userData);
    setShowMessageModal(true);
    loadMessages(userData._id);
  };

  // Load messages for chat
  const loadMessages = async (userId) => {
    try {
      console.log(`💬 Loading messages with user: ${userId}`);
      
      const response = await API.get(`/messages/${userId}`);
      console.log('💬 Messages API response:', response.data);
      
      if (response.data.success) {
        const messages = response.data.messages || [];
        console.log(`✅ Loaded ${messages.length} messages`);
        setMessages(messages);
      } else {
        throw new Error('Failed to load messages');
      }
      
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      console.log('Error details:', error.response?.data);
      
      console.log('🔄 Showing demo messages due to API error');
      const demoMessages = [
        {
          _id: 'demo1',
          senderId: userId,
          receiverId: currentUser._id,
          message: 'This is a demo conversation. Real messages will appear here once the backend is fully connected.',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          read: false
        },
        {
          _id: 'demo2',
          senderId: currentUser._id,
          receiverId: userId,
          message: 'Start exploring and connecting with other users to have real conversations!',
          timestamp: new Date(Date.now() - 2 * 60 * 1000),
          read: true
        }
      ];
      
      setMessages(demoMessages);
    }
  };

  // Send message
  const sendMessage = async (messageText) => {
    if (!messageRecipient) return;
    
    setSendingMessage(true);
    
    try {
      console.log(`💬 Sending message to: ${messageRecipient.username}`);
      
      const messageData = {
        receiverId: messageRecipient._id,
        message: messageText,
        messageType: 'text'
      };
      
      const response = await API.post('/messages/send', messageData);
      
      if (response.data.success) {
        const sentMessage = response.data.data;
        console.log('✅ Message sent successfully');
        
        // Add to local messages
        setMessages(prev => [...prev, sentMessage]);
      } else {
        throw new Error('Failed to send message');
      }
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Demo fallback
      const demoMessage = {
        _id: Date.now().toString(),
        senderId: currentUser._id,
        receiverId: messageRecipient._id,
        message: messageText,
        timestamp: new Date(),
        createdAt: new Date(),
        read: false
      };
      
      setMessages(prev => [...prev, demoMessage]);
      console.log('🔄 Message added in demo mode');
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle message button click
  const handleMessage = (userData = profileData) => {
    if (isOwnProfile) {
      // Self message - navigate to friends page
      navigate('/friends');
    } else {
      // Message another user
      handleMessageUser(userData);
    }
  };

  // Close popups
  const closeAllPopups = () => {
    setShowExplorersPopup(false);
    setShowExploringPopup(false);
    setShowMessageModal(false);
    setMessageRecipient(null);
    setMessages([]);
  };

  if (loading) {
    return (
      <div className="my-profile-page">
        <div className="loading-container">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="my-profile-page">
        <div className="loading-container">
          <p>User not found</p>
        </div>
      </div>
    );
  }

  const getDisplayName = () => {
    const fullName = `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim();
    return fullName || profileData.username || 'User';
  };

  const getAvatarInitial = () => {
    const fullName = getDisplayName();
    return fullName.charAt(0).toUpperCase();
  };

  return (
    <div className="my-profile-page">
      <ProfileHeader title={isOwnProfile ? "My Profile" : `${getDisplayName()}'s Profile`} />

      <div className="my-profile-content">
        <div className="profile-text">
          <h2 className="profile-name">{getDisplayName()}</h2>

          <ProfileStats 
            stats={stats}
            onExplorersClick={handleExplorersClick}
            onExploringClick={handleExploringClick}
            isOwnProfile={isOwnProfile}
            profileData={profileData}
          />

          <p className="profile-username">@{profileData.username}</p>
          {profileData.bio && <p className="profile-bio">{profileData.bio}</p>}

          <ProfileActions 
            isOwnProfile={isOwnProfile}
            profileData={profileData}
            isExploring={isExploring}
            onExplore={handleExplore}
            onMessage={handleMessage}
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
        <button className="visit-globe-button" onClick={() => navigate('/')}>
          Visit {profileData.username}'s Globe
        </button>
      </div>

      {/* Explorers Popup */}
      <UsersPopup
        isOpen={showExplorersPopup}
        onClose={closeAllPopups}
        title={`${isOwnProfile ? 'Your' : getDisplayName() + "'s"} Explorers (${stats.explorers})`}
        users={explorersList}
        loading={popupLoading}
        onMessageUser={handleMessageUser}
        emptyMessage={`${isOwnProfile ? 'You have' : 'This user has'} no explorers yet!`}
      />

      {/* Exploring Popup */}
      <UsersPopup
        isOpen={showExploringPopup}
        onClose={closeAllPopups}
        title={`${isOwnProfile ? "You're" : getDisplayName() + " is"} Exploring (${stats.exploring})`}
        users={exploringList}
        loading={popupLoading}
        onMessageUser={handleMessageUser}
        emptyMessage={`${isOwnProfile ? "You're" : "This user is"} not exploring anyone yet!`}
        emptyActionText={isOwnProfile ? "Discover Users" : undefined}
        emptyActionHandler={isOwnProfile ? () => navigate('/social') : undefined}
      />

      {/* Message Modal */}
      <ChatModal
        isOpen={showMessageModal}
        onClose={closeAllPopups}
        selectedFriend={messageRecipient}
        messages={messages}
        onSendMessage={sendMessage}
        sendingMessage={sendingMessage}
      />
    </div>
  );
};

export default UserProfile;