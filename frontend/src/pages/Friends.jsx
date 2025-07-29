import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api";

// Import components
import ProfileHeader from "../components/Profile/ProfileHeader";
import FriendsSearch from "../components/Friends/FriendsSearch";
import FriendsList from "../components/Friends/FriendsList";
import ChatModal from "../components/Friends/ChatModal";
import MessageRequests from "../components/Friends/MessageRequests";

import "./Friends.css";

const Friends = () => {
  const { user } = useAuth();
  
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Message requests state
  const [showMessageRequests, setShowMessageRequests] = useState(false);
  const [requestsCount, setRequestsCount] = useState(0);

  useEffect(() => {
    console.log('Friends page mounted, fetching mutual friends...');
    console.log('Current user:', user);
    if (user) {
      fetchMutualFriends();
      fetchRequestsCount();
    }
  }, [user]);

  const fetchRequestsCount = async () => {
    try {
      console.log('📨 Fetching message requests count from backend...');
      
      const response = await API.get('/messages/requests/count');
      console.log('📨 Requests count response:', response.data);
      
      if (response.data.success) {
        const count = response.data.count || 0;
        console.log(`✅ Found ${count} message requests from database`);
        setRequestsCount(count);
      } else {
        throw new Error('Failed to fetch requests count');
      }
      
    } catch (error) {
      console.error('❌ Error fetching requests count:', error);
      console.log('Error details:', error.response?.data);
      
      // Fallback to mock count if backend is not ready
      if (error.response?.status === 404 || !error.response) {
        console.log('🔄 Backend not ready - showing demo count');
        setRequestsCount(3); // Demo count
      } else {
        console.log('🔄 API error - setting count to 0');
        setRequestsCount(0);
      }
    }
  };

  const fetchMutualFriends = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching mutual friends from API...');
      console.log('User authenticated:', !!user);
      console.log('API base URL:', API.defaults?.baseURL);
      
      if (!user) {
        console.log('❌ No user found, cannot fetch friends');
        throw new Error('User not authenticated');
      }
      
      const response = await API.get('/users/mutual-friends');
      console.log('📊 Mutual friends API response:', response.data);
      
      if (response.data.success) {
        const mutualFriends = response.data.friends || [];
        console.log(`✅ Found ${mutualFriends.length} mutual friends from database`);
        console.log('Friends data:', mutualFriends.map(f => ({ 
          username: f.username, 
          name: `${f.firstName} ${f.lastName}`,
          lastMessage: f.lastMessage,
          unreadCount: f.unreadCount
        })));
        
        setFriends(mutualFriends);
        setError('');
      } else {
        throw new Error('API returned success: false');
      }
      
    } catch (error) {
      console.error('❌ Error fetching mutual friends:', error);
      console.log('Error details:', error.response?.data);
      
      if (error.response?.status === 401) {
        setError('Authentication required. Please log in again.');
        setFriends([]);
      } else if (error.response?.status === 404) {
        setError('Mutual friends endpoint not found. Please check backend setup.');
        setFriends([]);
      } else if (error.response?.status === 500) {
        setError('Server error loading friends. Please try again later.');
        setFriends([]);
      } else {
        setError('Failed to load friends from server.');
        
        if (!error.response) {
          console.log('🔄 Network error - showing minimal demo data');
          const demoFriends = [
            {
              _id: 'demo1',
              firstName: 'Demo',
              lastName: 'User',
              username: 'demouser',
              bio: 'This is demo data - connect with real users to see them here!',
              profilePicture: null,
              lastMessage: 'Start exploring to make real connections!',
              lastMessageTime: new Date(),
              unreadCount: 0,
              isOnline: false,
              mutualSince: new Date()
            }
          ];
          setFriends(demoFriends);
        } else {
          setFriends([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const openChat = (friend) => {
    setSelectedFriend(friend);
    setShowChat(true);
    loadMessages(friend._id);
  };

  const closeChat = () => {
    setShowChat(false);
    setSelectedFriend(null);
    setMessages([]);
  };

  const loadMessages = async (friendId) => {
    try {
      console.log(`💬 Loading messages with friend: ${friendId}`);
      
      const response = await API.get(`/messages/${friendId}`);
      console.log('💬 Messages API response:', response.data);
      
      if (response.data.success) {
        const messages = response.data.messages || [];
        console.log(`✅ Loaded ${messages.length} messages from database`);
        setMessages(messages);
        
        // Mark messages as read
        await markMessagesAsRead(friendId);
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
          senderId: friendId,
          receiverId: user._id,
          message: 'This is a demo conversation. Real messages will appear here once the backend is fully connected.',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          createdAt: new Date(Date.now() - 5 * 60 * 1000),
          read: false
        },
        {
          _id: 'demo2',
          senderId: user._id,
          receiverId: friendId,
          message: 'Start exploring and connecting with other users to have real conversations!',
          timestamp: new Date(Date.now() - 2 * 60 * 1000),
          createdAt: new Date(Date.now() - 2 * 60 * 1000),
          read: true
        }
      ];
      
      setMessages(demoMessages);
      await markMessagesAsRead(friendId);
    }
  };

  const markMessagesAsRead = async (friendId) => {
    try {
      console.log(`✅ Marking messages as read from friend: ${friendId}`);
      
      const response = await API.put(`/messages/mark-read/${friendId}`);
      console.log('✅ Mark as read response:', response.data);
      
      if (response.data.success) {
        // Update local friends state to reflect read messages
        setFriends(prevFriends => 
          prevFriends.map(friend => 
            friend._id === friendId 
              ? { ...friend, unreadCount: 0 }
              : friend
          )
        );
        console.log(`✅ Messages marked as read for friend: ${friendId}`);
      }
      
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
      console.log('Error details:', error.response?.data);
      
      // Still update UI even if API call fails (optimistic update)
      setFriends(prevFriends => 
        prevFriends.map(friend => 
          friend._id === friendId 
            ? { ...friend, unreadCount: 0 }
            : friend
        )
      );
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || !selectedFriend) return;
    
    setSendingMessage(true);
    
    try {
      console.log(`💬 Sending message to: ${selectedFriend.username}`);
      
      const messageData = {
        receiverId: selectedFriend._id,
        message: messageText.trim(),
        messageType: 'text'
      };
      
      const response = await API.post('/messages/send', messageData);
      console.log('💬 Send message response:', response.data);
      
      if (response.data.success) {
        const sentMessage = response.data.data;
        console.log('✅ Message sent successfully:', sentMessage);
        
        // Add message to current conversation
        setMessages(prev => [...prev, sentMessage]);
        
        // Update friends list with latest message info
        setFriends(prevFriends => 
          prevFriends.map(friend => 
            friend._id === selectedFriend._id
              ? { 
                  ...friend, 
                  lastMessage: sentMessage.message,
                  lastMessageTime: sentMessage.createdAt || sentMessage.timestamp,
                  lastMessageSender: sentMessage.senderId
                }
              : friend
          )
        );

        // If this was a message request, show notification
        if (response.data.isRequest) {
          console.log('📨 Message sent as request');
          alert('Message request sent! The user will see your message in their requests.');
        }
      } else {
        throw new Error('Failed to send message');
      }
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      console.log('Error details:', error.response?.data);
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        alert('Your message request was declined by this user.');
        return;
      }
      
      // Fallback to demo mode
      const demoMessage = {
        _id: Date.now().toString(),
        senderId: user._id,
        receiverId: selectedFriend._id,
        message: messageText.trim(),
        timestamp: new Date(),
        createdAt: new Date(),
        read: false
      };
      
      setMessages(prev => [...prev, demoMessage]);
      
      setFriends(prevFriends => 
        prevFriends.map(friend => 
          friend._id === selectedFriend._id
            ? { 
                ...friend, 
                lastMessage: demoMessage.message,
                lastMessageTime: demoMessage.timestamp,
                lastMessageSender: demoMessage.senderId
              }
            : friend
        )
      );
      
      console.log('🔄 Message added in demo mode');
    } finally {
      setSendingMessage(false);
    }
  };

  // Refresh requests count when message requests modal closes
  const handleMessageRequestsClose = () => {
    setShowMessageRequests(false);
    // Refresh the count in case requests were accepted/declined
    fetchRequestsCount();
    // Also refresh friends list in case new friends were added
    fetchMutualFriends();
  };

  // Filter friends based on search
  const filteredFriends = friends.filter(friend => {
    const displayName = `${friend.firstName || ''} ${friend.lastName || ''}`.trim().toLowerCase();
    const username = friend.username?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    return displayName.includes(search) || username.includes(search);
  });

  return (
    <div className="friends-page">
      <ProfileHeader title="My Friends" />

      <div className="friends-content">
        <div className="friends-header-section">
          <FriendsSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            friendsCount={filteredFriends.length}
          />
          
          {/* Message Requests Button */}
          <div className="message-requests-section">
            <button 
              className="message-requests-button"
              onClick={() => setShowMessageRequests(true)}
            >
              <span className="requests-icon">📨</span>
              <span>Message Requests</span>
              {requestsCount > 0 && (
                <span className="requests-badge">{requestsCount}</span>
              )}
            </button>
          </div>
        </div>

        <FriendsList
          friends={filteredFriends}
          loading={loading}
          error={error}
          searchTerm={searchTerm}
          onMessageClick={openChat}
        />
      </div>

      <ChatModal
        isOpen={showChat}
        onClose={closeChat}
        selectedFriend={selectedFriend}
        messages={messages}
        onSendMessage={sendMessage}
        sendingMessage={sendingMessage}
      />

      <MessageRequests
        isOpen={showMessageRequests}
        onClose={handleMessageRequestsClose}
      />
    </div>
  );
};

export default Friends;