import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api";
import './MessageRequests.css';

const MessageRequests = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessages, setRequestMessages] = useState([]);

  useEffect(() => {
    if (isOpen && user) {
      fetchMessageRequests();
    }
  }, [isOpen, user]);

  const fetchMessageRequests = async () => {
    try {
      setLoading(true);
      console.log('📨 Fetching message requests from backend...');
      
      const response = await API.get('/messages/requests');
      console.log('📨 Message requests response:', response.data);
      
      if (response.data.success) {
        const requestsData = response.data.requests || [];
        console.log(`✅ Found ${requestsData.length} message requests from database`);
        setRequests(requestsData);
      } else {
        throw new Error('Failed to fetch message requests');
      }
      
    } catch (error) {
      console.error('❌ Error fetching message requests:', error);
      console.log('Error details:', error.response?.data);
      
      // Handle different error scenarios
      if (error.response?.status === 401) {
        console.log('❌ Authentication required');
        setRequests([]);
      } else if (error.response?.status === 404) {
        console.log('🔄 Message requests endpoint not found - showing demo data');
        setDemoRequests();
      } else if (!error.response) {
        console.log('🔄 Network error - showing demo data');
        setDemoRequests();
      } else {
        console.log('🔄 API error - showing demo data');
        setDemoRequests();
      }
    } finally {
      setLoading(false);
    }
  };

  const setDemoRequests = () => {
    const mockRequests = [
      {
        _id: 'req1',
        senderId: 'user1',
        senderUsername: 'traveler_alex',
        senderFirstName: 'Alex',
        senderLastName: 'Johnson',
        senderProfilePicture: null,
        lastMessage: 'Hey! I saw your travel photos from Tokyo. Would love to get some recommendations!',
        messageCount: 3,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isOnline: true
      },
      {
        _id: 'req2',
        senderId: 'user2',
        senderUsername: 'foodie_maria',
        senderFirstName: 'Maria',
        senderLastName: 'Santos',
        senderProfilePicture: null,
        lastMessage: 'Hi! I\'m planning a trip to the same places you visited. Can we chat?',
        messageCount: 1,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isOnline: false
      },
      {
        _id: 'req3',
        senderId: 'user3',
        senderUsername: 'adventure_seeker',
        senderFirstName: 'David',
        senderLastName: 'Kim',
        senderProfilePicture: null,
        lastMessage: 'Love your travel content! Mind if I ask about your camera gear?',
        messageCount: 2,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isOnline: false
      }
    ];
    setRequests(mockRequests);
  };

  const getDisplayName = (request) => {
    const fullName = `${request.senderFirstName || ''} ${request.senderLastName || ''}`.trim();
    return fullName || request.senderUsername || 'User';
  };

  const getAvatarInitial = (request) => {
    const displayName = getDisplayName(request);
    return displayName.charAt(0).toUpperCase();
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const openRequestModal = async (request) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
    await loadRequestMessages(request.senderId);
  };

  const loadRequestMessages = async (senderId) => {
    try {
      console.log(`📨 Loading request messages from: ${senderId}`);
      
      const response = await API.get(`/messages/requests/${senderId}`);
      console.log('📨 Request messages response:', response.data);
      
      if (response.data.success) {
        const messages = response.data.messages || [];
        console.log(`✅ Loaded ${messages.length} request messages from database`);
        setRequestMessages(messages);
      } else {
        throw new Error('Failed to load request messages');
      }
      
    } catch (error) {
      console.error('❌ Error loading request messages:', error);
      console.log('Error details:', error.response?.data);
      
      // Fallback to mock messages
      console.log('🔄 Showing mock messages due to API error');
      const mockMessages = [
        {
          _id: 'msg1',
          senderId: senderId,
          receiverId: user._id,
          message: 'Hey! I saw your travel photos from Tokyo. Would love to get some recommendations!',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: false
        },
        {
          _id: 'msg2',
          senderId: senderId,
          receiverId: user._id,
          message: 'Especially interested in local food spots and hidden gems!',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
          read: false
        },
        {
          _id: 'msg3',
          senderId: senderId,
          receiverId: user._id,
          message: 'Thanks in advance! 🙏',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 10 * 60 * 1000),
          read: false
        }
      ];
      setRequestMessages(mockMessages);
    }
  };

  const acceptRequest = async (request) => {
    try {
      console.log(`✅ Accepting message request from: ${request.senderUsername}`);
      
      const response = await API.post(`/messages/requests/${request.senderId}/accept`);
      console.log('✅ Accept request response:', response.data);
      
      if (response.data.success) {
        // Remove from requests list
        setRequests(prev => prev.filter(req => req._id !== request._id));
        
        // Close modal
        setShowRequestModal(false);
        setSelectedRequest(null);
        
        // Show success message
        alert(`Request accepted! You can now chat with ${getDisplayName(request)}.`);
        
        // Optionally refresh the friends list or navigate to chat
        if (onClose) onClose();
      } else {
        throw new Error('Failed to accept request');
      }
      
    } catch (error) {
      console.error('❌ Error accepting request:', error);
      console.log('Error details:', error.response?.data);
      
      // Handle demo requests differently
      if (request._id.startsWith('req')) {
        console.log('🔄 Accepting demo request');
        setRequests(prev => prev.filter(req => req._id !== request._id));
        setShowRequestModal(false);
        setSelectedRequest(null);
        alert(`Demo request accepted! You can now chat with ${getDisplayName(request)}.`);
      } else {
        alert('Failed to accept request. Please try again.');
      }
    }
  };

  const declineRequest = async (request) => {
    try {
      console.log(`❌ Declining message request from: ${request.senderUsername}`);
      
      const response = await API.post(`/messages/requests/${request.senderId}/decline`);
      console.log('❌ Decline request response:', response.data);
      
      if (response.data.success) {
        // Remove from requests list
        setRequests(prev => prev.filter(req => req._id !== request._id));
        
        // Close modal
        setShowRequestModal(false);
        setSelectedRequest(null);
      } else {
        throw new Error('Failed to decline request');
      }
      
    } catch (error) {
      console.error('❌ Error declining request:', error);
      console.log('Error details:', error.response?.data);
      
      // Handle demo requests differently
      if (request._id.startsWith('req')) {
        console.log('🔄 Declining demo request');
        setRequests(prev => prev.filter(req => req._id !== request._id));
        setShowRequestModal(false);
        setSelectedRequest(null);
      } else {
        alert('Failed to decline request. Please try again.');
      }
    }
  };

  const closeRequestModal = () => {
    setShowRequestModal(false);
    setSelectedRequest(null);
    setRequestMessages([]);
  };

  if (!isOpen) return null;

  return (
    <div className="message-requests-overlay" onClick={onClose}>
      <div className="message-requests-modal" onClick={(e) => e.stopPropagation()}>
        <div className="message-requests-header">
          <h3>Message Requests ({requests.length})</h3>
          <button className="popup-close" onClick={onClose}>×</button>
        </div>
        
        <div className="message-requests-content">
          {loading ? (
            <div className="requests-loading">
              <div className="loading-spinner"></div>
              <p>Loading requests...</p>
            </div>
          ) : requests.length > 0 ? (
            <div className="requests-list">
              {requests.map((request) => (
                <div 
                  key={request._id} 
                  className="request-item"
                  onClick={() => openRequestModal(request)}
                >
                  <div className="request-avatar-container">
                    {request.senderProfilePicture ? (
                      <img src={request.senderProfilePicture} alt="Profile" className="request-avatar" />
                    ) : (
                      <div className="request-avatar-placeholder">
                        {getAvatarInitial(request)}
                      </div>
                    )}
                    {request.isOnline && <div className="online-indicator"></div>}
                  </div>
                  
                  <div className="request-info">
                    <div className="request-header-row">
                      <h4 className="request-name">{getDisplayName(request)}</h4>
                      <span className="request-time">{formatTime(request.timestamp)}</span>
                    </div>
                    <p className="request-username">@{request.senderUsername}</p>
                    <p className="request-message">{request.lastMessage}</p>
                    {request.messageCount > 1 && (
                      <span className="message-count">{request.messageCount} messages</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-requests">
              <div className="no-requests-icon">📨</div>
              <h4>No message requests</h4>
              <p>When someone who doesn't follow you sends a message, it will appear here.</p>
            </div>
          )}
        </div>

        {/* Request Detail Modal */}
        {showRequestModal && selectedRequest && (
          <div className="request-detail-overlay" onClick={closeRequestModal}>
            <div className="request-detail-modal" onClick={(e) => e.stopPropagation()}>
              <div className="request-detail-header">
                <div className="request-sender-info">
                  <div className="request-sender-avatar">
                    {selectedRequest.senderProfilePicture ? (
                      <img src={selectedRequest.senderProfilePicture} alt="Profile" />
                    ) : (
                      <div className="request-sender-avatar-placeholder">
                        {getAvatarInitial(selectedRequest)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4>{getDisplayName(selectedRequest)}</h4>
                    <p>@{selectedRequest.senderUsername}</p>
                    <span className="request-detail-time">{formatTime(selectedRequest.timestamp)}</span>
                  </div>
                </div>
                <button className="popup-close" onClick={closeRequestModal}>×</button>
              </div>
              
              <div className="request-messages">
                {requestMessages.map((message) => (
                  <div key={message._id} className="request-message-item">
                    <div className="message-content">
                      {message.message}
                    </div>
                    <div className="message-time">
                      {new Date(message.timestamp || message.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="request-actions">
                <button 
                  className="decline-button"
                  onClick={() => declineRequest(selectedRequest)}
                >
                  Decline
                </button>
                <button 
                  className="accept-button"
                  onClick={() => acceptRequest(selectedRequest)}
                >
                  Accept
                </button>
              </div>
              
              <div className="request-note">
                <p>💡 You can only reply after accepting this request</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageRequests;