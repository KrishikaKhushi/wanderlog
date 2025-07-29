import React, { useState, useRef } from 'react';
import './SuggestionCard.css';

const SuggestionCard = ({ 
  suggestion, 
  onExplore, 
  onSave, 
  onShare,
  isSaved = false,
  isLoading = false,
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef(null);

  const getDifficultyConfig = (difficulty) => {
    const configs = {
      'Easy': { 
        color: '#10b981', 
        bg: '#d1fae5', 
        icon: '🟢',
        description: 'Perfect for beginners'
      },
      'Medium': { 
        color: '#f59e0b', 
        bg: '#fef3c7', 
        icon: '🟡',
        description: 'Some experience helpful'
      },
      'Hard': { 
        color: '#ef4444', 
        bg: '#fee2e2', 
        icon: '🔴',
        description: 'Expert level recommended'
      }
    };
    return configs[difficulty] || { 
      color: '#6b7280', 
      bg: '#f3f4f6', 
      icon: '⚪',
      description: 'Difficulty varies'
    };
  };

  const getBudgetConfig = (budget) => {
    const configs = {
      '$': { 
        display: 'Budget-friendly', 
        icon: '💵', 
        color: '#10b981',
        range: '$20-50/day'
      },
      '$$': { 
        display: 'Moderate', 
        icon: '💰', 
        color: '#f59e0b',
        range: '$50-100/day'
      },
      '$$$': { 
        display: 'Premium', 
        icon: '💎', 
        color: '#8b5cf6',
        range: '$100-200/day'
      },
      '$$$$': { 
        display: 'Luxury', 
        icon: '👑', 
        color: '#ec4899',
        range: '$200+/day'
      }
    };
    return configs[budget] || { 
      display: 'Varies', 
      icon: '💱', 
      color: '#6b7280',
      range: 'Contact for rates'
    };
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleExplore = () => {
    if (!isLoading && onExplore) {
      onExplore(suggestion);
    }
  };

  const handleSave = (e) => {
    e.stopPropagation();
    if (onSave) {
      onSave(suggestion);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (onShare) {
      onShare(suggestion);
    } else {
      // Fallback to native share or copy to clipboard
      if (navigator.share) {
        navigator.share({
          title: suggestion.title,
          text: suggestion.description,
          url: window.location.href
        });
      } else {
        // Copy to clipboard fallback
        navigator.clipboard?.writeText(
          `${suggestion.title} in ${suggestion.city}, ${suggestion.country} - ${suggestion.description}`
        );
      }
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const difficultyConfig = getDifficultyConfig(suggestion.difficulty);
  const budgetConfig = getBudgetConfig(suggestion.budget);

  return (
    <div 
      className={`suggestion-card ${className} ${isExpanded ? 'expanded' : ''}`}
      ref={cardRef}
    >
      {/* Card Header with Image */}
      <div className="card-image-container">
        {!imageError ? (
          <>
            <img 
              src={suggestion.image} 
              alt={suggestion.title}
              className={`card-image ${imageLoaded ? 'loaded' : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
            {!imageLoaded && (
              <div className="image-skeleton">
                <div className="skeleton-shimmer"></div>
              </div>
            )}
          </>
        ) : (
          <div className="image-fallback">
            <div className="fallback-icon">🏞️</div>
            <span>No image available</span>
          </div>
        )}
        
        {/* Image Overlay */}
        <div className="image-overlay">
          <div className="overlay-top">
            <span className="country-flag">{suggestion.flag || '🌍'}</span>
            <span className="country-label">{suggestion.country}</span>
          </div>
          
          <div className="overlay-actions">
            <button 
              className={`action-btn save-btn ${isSaved ? 'saved' : ''}`}
              onClick={handleSave}
              aria-label={isSaved ? 'Remove from saved' : 'Save destination'}
              title={isSaved ? 'Remove from saved' : 'Save destination'}
            >
              {isSaved ? '❤️' : '🤍'}
            </button>
            <button 
              className="action-btn share-btn"
              onClick={handleShare}
              aria-label="Share destination"
              title="Share destination"
            >
              📤
            </button>
          </div>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="card-content">
        {/* Header */}
        <div className="card-header">
          <div className="title-section">
            <h3 className="card-title">{suggestion.title}</h3>
            <p className="city-name">
              📍 {suggestion.city}, {suggestion.country}
            </p>
          </div>
          
          {suggestion.rating && (
            <div className="rating-section">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`star ${i < Math.floor(suggestion.rating) ? 'filled' : ''}`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <span className="rating-text">{suggestion.rating}/5</span>
            </div>
          )}
        </div>
        
        {/* Description */}
        <p className={`description ${isExpanded ? 'expanded' : ''}`}>
          {suggestion.description}
        </p>
        
        {suggestion.description && suggestion.description.length > 120 && (
          <button 
            className="read-more-btn"
            onClick={toggleExpanded}
          >
            {isExpanded ? 'Read less' : 'Read more'}
          </button>
        )}
        
        {/* Quick Info Grid */}
        <div className="quick-info-grid">
          <div className="info-item">
            <span className="info-icon">🗓️</span>
            <div className="info-content">
              <span className="info-label">Best Time</span>
              <span className="info-value">{suggestion.bestTime}</span>
            </div>
          </div>
          
          <div className="info-item">
            <span className="info-icon">🌡️</span>
            <div className="info-content">
              <span className="info-label">Temperature</span>
              <span className="info-value">{suggestion.temperature}</span>
            </div>
          </div>
          
          <div className="info-item">
            <span className="info-icon">{budgetConfig.icon}</span>
            <div className="info-content">
              <span className="info-label">Budget</span>
              <span className="info-value" style={{ color: budgetConfig.color }}>
                {budgetConfig.display}
              </span>
              <span className="info-range">{budgetConfig.range}</span>
            </div>
          </div>
          
          <div className="info-item">
            <span className="info-icon">{difficultyConfig.icon}</span>
            <div className="info-content">
              <span className="info-label">Difficulty</span>
              <span 
                className="difficulty-badge"
                style={{ 
                  color: difficultyConfig.color,
                  backgroundColor: difficultyConfig.bg
                }}
              >
                {suggestion.difficulty}
              </span>
              <span className="info-help">{difficultyConfig.description}</span>
            </div>
          </div>
        </div>
        
        {/* Activities Section */}
        {suggestion.activities && suggestion.activities.length > 0 && (
          <div className="activities-section">
            <h4 className="section-title">
              🎯 Top Activities
              <span className="activity-count">({suggestion.activities.length})</span>
            </h4>
            <div className="activity-tags">
              {suggestion.activities.slice(0, isExpanded ? undefined : 4).map((activity, index) => (
                <span key={index} className="activity-tag">
                  {activity}
                </span>
              ))}
              {!isExpanded && suggestion.activities.length > 4 && (
                <button 
                  className="activity-tag more-activities"
                  onClick={toggleExpanded}
                >
                  +{suggestion.activities.length - 4} more
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Why Now Section */}
        {suggestion.reason && (
          <div className="why-now-section">
            <h4 className="section-title">✨ Why Visit Now?</h4>
            <p className="why-now-text">{suggestion.reason}</p>
          </div>
        )}
        
        {/* Additional Info (Expanded) */}
        {isExpanded && (
          <div className="expanded-content">
            {suggestion.highlights && (
              <div className="highlights-section">
                <h4 className="section-title">🌟 Highlights</h4>
                <ul className="highlights-list">
                  {suggestion.highlights.map((highlight, index) => (
                    <li key={index}>{highlight}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {suggestion.tips && (
              <div className="tips-section">
                <h4 className="section-title">💡 Travel Tips</h4>
                <ul className="tips-list">
                  {suggestion.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="card-actions">
          <button 
            className={`explore-button ${isLoading ? 'loading' : ''}`}
            onClick={handleExplore}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Exploring...
              </>
            ) : (
              <>
                🌍 Explore {suggestion.country}
              </>
            )}
          </button>
          
          {suggestion.bookingUrl && (
            <a 
              href={suggestion.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="booking-button"
            >
              📅 Book Now
            </a>
          )}
        </div>
        
        {/* Footer Meta */}
        <div className="card-footer">
          {suggestion.duration && (
            <span className="duration">⏱️ {suggestion.duration}</span>
          )}
          {suggestion.distance && (
            <span className="distance">📏 {suggestion.distance}</span>
          )}
          {suggestion.lastUpdated && (
            <span className="last-updated">
              Updated {new Date(suggestion.lastUpdated).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuggestionCard;