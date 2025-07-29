import React, { useState, useCallback } from 'react';
import './CropArea.css';

const CropArea = ({ cropArea, setCropArea, containerBounds }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e, action) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDragStart({ x, y });
    
    if (action === 'drag') {
      setIsDragging(true);
    } else if (action === 'resize') {
      setIsResizing(true);
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging && !isResizing) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isDragging) {
      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;
      
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(prev.x + deltaX, containerBounds.width - prev.width)),
        y: Math.max(0, Math.min(prev.y + deltaY, containerBounds.height - prev.height))
      }));
      
      setDragStart({ x, y });
    } else if (isResizing) {
      const newWidth = Math.max(50, x - cropArea.x);
      const newHeight = Math.max(50, y - cropArea.y);
      const size = Math.min(newWidth, newHeight);
      
      setCropArea(prev => ({
        ...prev,
        width: Math.min(size, containerBounds.width - prev.x),
        height: Math.min(size, containerBounds.height - prev.y)
      }));
    }
  }, [isDragging, isResizing, dragStart, cropArea.x, setCropArea, containerBounds]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  return (
    <div 
      className="crop-overlay-container"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        className="crop-overlay"
        style={{
          left: cropArea.x,
          top: cropArea.y,
          width: cropArea.width,
          height: cropArea.height
        }}
        onMouseDown={(e) => handleMouseDown(e, 'drag')}
      >
        <div className="crop-grid">
          <div className="grid-line grid-line-v" style={{ left: '33.33%' }}></div>
          <div className="grid-line grid-line-v" style={{ left: '66.66%' }}></div>
          <div className="grid-line grid-line-h" style={{ top: '33.33%' }}></div>
          <div className="grid-line grid-line-h" style={{ top: '66.66%' }}></div>
        </div>
        <div 
          className="resize-handle"
          onMouseDown={(e) => handleMouseDown(e, 'resize')}
        ></div>
      </div>
    </div>
  );
};

export default CropArea;