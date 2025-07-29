import { useState, useEffect } from 'react';

export const useZoomLevel = (globeEl) => {
  const [showSmallLabels, setShowSmallLabels] = useState(false);

  useEffect(() => {
    let animationFrameId;
    const checkZoom = () => {
      if (globeEl.current) {
        const distance = globeEl.current.camera().position.length();
        setShowSmallLabels(distance < 300);
      }
      animationFrameId = requestAnimationFrame(checkZoom);
    };
    checkZoom();
    return () => cancelAnimationFrame(animationFrameId);
  }, [globeEl]);

  return showSmallLabels;
};