// src/components/Gallery/SlideshowView.jsx
import React, { useRef, useEffect, useState } from "react";
import "./SlideshowView.css";

const AUTO_PLAY_DELAY = 5000;
const AUTO_PLAY_INTERVAL = 3000;

const SlideshowView = ({ photos, currentSlide, setCurrentSlide }) => {
  const imageRef = useRef(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const inactivityTimer = useRef(null);
  const autoPlayTimer = useRef(null);

  useEffect(() => {
    setAutoPlay(false);
    clearTimers();
    startInactivityTimer();
  }, [photos.length]);

  useEffect(() => {
    return () => clearTimers();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      resetInactivityTimer();

      if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Escape") {
        exitFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide]);

  useEffect(() => {
    if (autoPlay) {
      autoPlayTimer.current = setInterval(() => {
        nextSlide();
      }, AUTO_PLAY_INTERVAL);
    } else {
      clearInterval(autoPlayTimer.current);
    }
    return () => clearInterval(autoPlayTimer.current);
  }, [autoPlay]);

  const clearTimers = () => {
    clearTimeout(inactivityTimer.current);
    clearInterval(autoPlayTimer.current);
  };

  const startInactivityTimer = () => {
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      setAutoPlay(true);
    }, AUTO_PLAY_DELAY);
  };

  const resetInactivityTimer = () => {
    setAutoPlay(false);
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      setAutoPlay(true);
    }, AUTO_PLAY_DELAY);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % photos.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const requestFullscreen = () => {
    const elem = imageRef.current;
    if (!elem) return;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  const toggleFullscreen = () => {
    if (
      document.fullscreenElement === imageRef.current ||
      document.webkitFullscreenElement === imageRef.current ||
      document.msFullscreenElement === imageRef.current
    ) {
      exitFullscreen();
    } else {
      requestFullscreen();
    }
  };

  // Early return if no photos
  if (!photos || photos.length === 0) {
    return (
      <div className="slideshow-wrapper">
        <div className="slideshow-container">
          <div className="no-photos-message">
            <p>No photos to display</p>
          </div>
        </div>
      </div>
    );
  }

  const currentPhoto = photos[currentSlide];

  return (
    <div className="slideshow-wrapper">
      <div className="slideshow-container">
        <img
          ref={imageRef}
          src={currentPhoto?.url} // FIXED: Use currentPhoto.url instead of photos[currentSlide]
          alt={currentPhoto?.caption || `slide-${currentSlide}`}
          className="slideshow-image"
          onClick={resetInactivityTimer}
          onDoubleClick={toggleFullscreen}
          tabIndex={0}
        />
        
        {/* Navigation arrows */}
        {photos.length > 1 && (
          <>
            <button 
              className="slideshow-nav prev" 
              onClick={prevSlide}
              aria-label="Previous photo"
            >
              ❮
            </button>
            <button 
              className="slideshow-nav next" 
              onClick={nextSlide}
              aria-label="Next photo"
            >
              ❯
            </button>
          </>
        )}

        {/* Photo counter */}
        {photos.length > 1 && (
          <div className="slideshow-counter">
            {currentSlide + 1} / {photos.length}
          </div>
        )}

        {/* Auto-play indicator */}
        {autoPlay && (
          <div className="autoplay-indicator">
            ▶️ Auto-play
          </div>
        )}
      </div>
    </div>
  );
};

export default SlideshowView;