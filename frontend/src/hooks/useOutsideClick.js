import { useEffect } from 'react';

export const useOutsideClick = (activePanel, setActivePanel, pinMode) => {
  useEffect(() => {
    const handleClickOutside = (e) => {
      const profilePanel = document.querySelector('.profile-slideout');
      const pinPanel = document.querySelector('.pin-slideout');
      const controlIcons = document.querySelector('.control-buttons');

      const clickedInsideProfile = profilePanel?.contains(e.target);
      const clickedInsidePin = pinPanel?.contains(e.target);
      const clickedIcon = controlIcons?.contains(e.target);

      const shouldCloseProfile = !clickedInsideProfile && !clickedIcon && activePanel === 'profile';
      const shouldClosePin = !clickedInsidePin && !clickedIcon && activePanel === 'pin' && !pinMode;

      if (shouldCloseProfile || shouldClosePin) {
        setActivePanel(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activePanel, setActivePanel, pinMode]);
};