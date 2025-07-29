import React, { useState, useRef, useEffect } from 'react';
import './SearchBar.css';

const SearchBar = ({ 
  searchInput, 
  suggestions, 
  onSearchChange, 
  onSuggestionClick,
  placeholder = "Search for a country...",
  isLoading = false,
  onClear,
  maxSuggestions = 8
}) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Show suggestions when there's input and suggestions exist
  const showSuggestions = isOpen && searchInput.trim() && suggestions.length > 0;
  const displayedSuggestions = suggestions.slice(0, maxSuggestions);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < displayedSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(displayedSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    onSuggestionClick(suggestion.name || suggestion);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Handle input change
  const handleInputChange = (e) => {
    onSearchChange(e);
    setSelectedIndex(-1);
    setIsOpen(true);
  };

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
  };

  // Handle clear button
  const handleClear = () => {
    if (onClear) {
      onClear();
    }
    setIsOpen(false);
    setSelectedIndex(-1);
    searchRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="search-bar-container" ref={searchRef}>
      <div className="search-input-wrapper">
        {/* Search Icon */}
        <svg 
          className="search-icon" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none"
        >
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
        </svg>

        {/* Input Field */}
        <input
          type="text"
          className="search-bar"
          placeholder={placeholder}
          value={searchInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          autoComplete="off"
          aria-label="Search for countries"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="search-loading">
            <div className="spinner"></div>
          </div>
        )}

        {/* Clear Button */}
        {searchInput && !isLoading && (
          <button
            type="button"
            className="search-clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="suggestions-dropdown">
          <ul 
            className="suggestions-list"
            ref={suggestionsRef}
            role="listbox"
            aria-label="Country suggestions"
          >
            {displayedSuggestions.map((suggestion, index) => (
              <li
                key={suggestion.name || suggestion}
                id={`suggestion-${index}`}
                className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSuggestionClick(suggestion)}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div className="suggestion-content">
                  <span className="suggestion-name">
                    {suggestion.name || suggestion}
                  </span>
                  {suggestion.region && (
                    <span className="suggestion-region">
                      {suggestion.region}
                    </span>
                  )}
                </div>
                {suggestion.flag && (
                  <span className="suggestion-flag">
                    {suggestion.flag}
                  </span>
                )}
              </li>
            ))}
          </ul>
          
          {/* Show "View all results" if there are more suggestions */}
          {suggestions.length > maxSuggestions && (
            <div className="suggestions-footer">
              <button className="view-all-button">
                View all {suggestions.length} results
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;