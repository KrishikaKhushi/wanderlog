import React, { useState } from 'react';
import { useAuth } from "../../context/AuthContext";
import './ChatModal.css';

const ChatModal = ({ 
  isOpen, 
  onClose, 
  selectedFriend, 
  messages, 
  onSendMessage, 
  sendingMessage 
}) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');

  if (!isOpen || !selectedFriend) return null;

  const getDisplayName = (friend) => {
    const fullName = `${friend.firstName || ''} ${friend.lastName || ''}`.trim();
    return fullName || friend.username || 'User';
  };

  const getAvatarInitial = (friend) => {
    const displayName = getDisplayName(friend);
    return displayName.charAt(0).toUpperCase();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage.trim());
    setNewMessage('');
  };

  return (
    <div className="chat-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <div className="chat-user-info">
            <div className="chat-avatar-container">
              {selectedFriend.profilePicture ? (
                <img src={selectedFriend.profilePicture} alt="Profile" className="chat-avatar" />
              ) : (
                <div className="chat-avatar-placeholder">
                  {getAvatarInitial(selectedFriend)}
                </div>
              )}
              {selectedFriend.isOnline && <div className="online-indicator"></div>}
            </div>
            <div>
              <h4>{getDisplayName(selectedFriend)}</h4>
              <span className="chat-status">
                {selectedFriend.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <button className="chat-close" onClick={onClose}>×</button>
        </div>
        
        <div className="chat-messages">
          {messages.map((message) => (
            <div 
              key={message._id} 
              className={`message ${message.senderId === user._id ? 'sent' : 'received'}`}
            >
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
          {messages.length === 0 && (
            <div className="no-messages">
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
        </div>
        
        <div className="chat-input-section">
          <div className="chat-input-container">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="chat-input"
              rows="1"
              maxLength="1000"
            />
            <button 
              className="send-button"
              onClick={handleSend}
              disabled={!newMessage.trim() || sendingMessage}
            >
              {sendingMessage ? '...' : '→'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;