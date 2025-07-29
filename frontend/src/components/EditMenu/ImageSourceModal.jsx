import React, { useRef } from 'react';
import Modal from './Modal';
import './ImageSourceModal.css';

const ImageSourceModal = ({ isOpen, onClose, onSourceSelect }) => {
  const fileInputRef = useRef(null);

  const handleSystemSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onSourceSelect('system', file);
    }
  };

  const handleDriveSelect = () => {
    onSourceSelect('drive');
  };

  if (!isOpen) return null;

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        title="Choose Image Source"
      >
        <div className="source-options">
          <button 
            className="source-option"
            onClick={handleSystemSelect}
          >
            <span className="source-icon">💻</span>
            <span>From Device</span>
            <small>Choose from your computer or phone</small>
          </button>
          <button 
            className="source-option"
            onClick={handleDriveSelect}
          >
            <span className="source-icon">☁️</span>
            <span>From Google Drive</span>
            <small>Select from your cloud storage</small>
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ImageSourceModal;