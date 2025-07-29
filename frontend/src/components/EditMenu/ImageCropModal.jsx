import React, { useRef, useState, useCallback } from 'react';
import Modal from './Modal';
import CropArea from './CropArea';
import './ImageCropModal.css';

const ImageCropModal = ({ isOpen, originalImage, onClose, onSave }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 200, height: 200 });

  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      const containerWidth = 400;
      const containerHeight = 300;
      
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const containerAspect = containerWidth / containerHeight;
      
      let displayWidth, displayHeight;
      if (imgAspect > containerAspect) {
        displayWidth = containerWidth;
        displayHeight = containerWidth / imgAspect;
      } else {
        displayHeight = containerHeight;
        displayWidth = containerHeight * imgAspect;
      }
      
      const cropSize = Math.min(displayWidth, displayHeight) * 0.6;
      setCropArea({
        x: (displayWidth - cropSize) / 2,
        y: (displayHeight - cropSize) / 2,
        width: cropSize,
        height: cropSize
      });
    }
  }, []);

  const handleCropSave = () => {
    if (!imageRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    
    ctx.drawImage(
      img,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      cropArea.width,
      cropArea.height
    );
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'cropped-profile.jpg', { type: 'image/jpeg' });
      const dataUrl = canvas.toDataURL();
      onSave(dataUrl, file);
    }, 'image/jpeg', 0.9);
  };

  if (!isOpen || !originalImage) return null;

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        title="Crop & Edit Image"
        size="large"
      >
        <div className="crop-container">
          <div className="crop-area-container">
            <img 
              ref={imageRef}
              src={originalImage} 
              alt="Crop preview" 
              className="crop-image"
              onLoad={handleImageLoad}
              draggable={false}
            />
            <CropArea 
              cropArea={cropArea}
              setCropArea={setCropArea}
              containerBounds={{ width: 400, height: 300 }}
            />
          </div>
        </div>
        <div className="crop-actions">
          <button 
            className="cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="save-profile-button"
            onClick={handleCropSave}
          >
            Save Changes
          </button>
        </div>
      </Modal>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
};

export default ImageCropModal;