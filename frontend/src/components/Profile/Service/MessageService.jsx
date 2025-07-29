import { useState } from 'react';
import API from '../../../api';

// Custom hook for message functionality
const useMessages = (currentUser) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Load messages between current user and another user
  const loadMessages = async (userId) => {
    if (!userId || !currentUser) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`💬 Loading messages with user: ${userId}`);
      
      const response = await API.get(`/messages/${userId}`);
      
      if (response.data.success) {
        const loadedMessages = response.data.messages || [];
        console.log(`✅ Loaded ${loadedMessages.length} messages`);
        setMessages(loadedMessages);
        return loadedMessages;
      } else {
        throw new Error('Failed to load messages');
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      setError(error.message);
      
      // Return demo messages as fallback
      const demoMessages = createDemoMessages(userId, currentUser._id);
      setMessages(demoMessages);
      return demoMessages;
    } finally {
      setLoading(false);
    }
  };

  // Load self messages (notes to self)
  const loadSelfMessages = async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`💬 Loading self-messages for: ${currentUser.username}`);
      
      const response = await API.get(`/messages/${currentUser._id}`);
      
      if (response.data.success) {
        const selfMessages = response.data.messages || [];
        console.log(`✅ Loaded ${selfMessages.length} self-messages`);
        setMessages(selfMessages);
        return selfMessages;
      } else {
        throw new Error('Failed to load self messages');
      }
    } catch (error) {
      console.error('❌ Error loading self messages:', error);
      setError(error.message);
      
      // Return demo self messages
      const demoSelfMessages = createDemoSelfMessages(currentUser._id);
      setMessages(demoSelfMessages);
      return demoSelfMessages;
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (receiverId, messageText, messageType = 'text') => {
    if (!receiverId || !messageText.trim() || !currentUser) return;

    setSending(true);
    setError(null);

    try {
      console.log(`💬 Sending message to: ${receiverId}`);
      
      const messageData = {
        receiverId,
        message: messageText.trim(),
        messageType
      };
      
      const response = await API.post('/messages/send', messageData);
      
      if (response.data.success) {
        const sentMessage = response.data.data;
        console.log('✅ Message sent successfully');
        
        // Add to local messages
        setMessages(prev => [...prev, sentMessage]);
        return sentMessage;
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setError(error.message);
      
      // Create demo message as fallback
      const demoMessage = {
        _id: Date.now().toString(),
        senderId: currentUser._id,
        receiverId,
        message: messageText.trim(),
        messageType,
        timestamp: new Date(),
        createdAt: new Date(),
        read: false
      };
      
      setMessages(prev => [...prev, demoMessage]);
      console.log('🔄 Message added in demo mode');
      return demoMessage;
    } finally {
      setSending(false);
    }
  };

  // Mark messages as read
  const markAsRead = async (userId) => {
    try {
      await API.put(`/messages/mark-read/${userId}`);
      
      // Update local messages
      setMessages(prev => 
        prev.map(msg => 
          msg.senderId === userId && msg.receiverId === currentUser._id
            ? { ...msg, read: true }
            : msg
        )
      );
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
    }
  };

  // Clear messages
  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    loading,
    sending,
    error,
    loadMessages,
    loadSelfMessages,
    sendMessage,
    markAsRead,
    clearMessages
  };
};

// Helper function to create demo messages
const createDemoMessages = (otherUserId, currentUserId) => {
  return [
    {
      _id: 'demo1',
      senderId: otherUserId,
      receiverId: currentUserId,
      message: 'This is a demo conversation. Real messages will appear here once the backend is fully connected.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      read: false
    },
    {
      _id: 'demo2',
      senderId: currentUserId,
      receiverId: otherUserId,
      message: 'Start exploring and connecting with other users to have real conversations!',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 60 * 1000),
      read: true
    }
  ];
};

// Helper function to create demo self messages
const createDemoSelfMessages = (userId) => {
  return [
    {
      _id: 'self-demo1',
      senderId: userId,
      receiverId: userId,
      message: 'This is a note to myself! Self-messaging can be useful for reminders and notes.',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
      read: true
    },
    {
      _id: 'self-demo2',
      senderId: userId,
      receiverId: userId,
      message: 'Remember to check out that new restaurant in Tokyo! 🍜',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      read: true
    }
  ];
};

export default useMessages;
export { useMessages };