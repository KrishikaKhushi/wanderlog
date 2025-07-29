import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import './Globe.css';

// Custom hooks
import { useGlobeData } from '../hooks/useGlobeData';
import { useCountrySearch } from '../hooks/useCountrySearch';
import { useGlobeNavigation } from '../hooks/useGlobeNavigation';
import { usePinManagement } from '../hooks/usePinManagement';
import { useDimensions } from '../hooks/useDimensions';
import { useZoomLevel } from '../hooks/useZoomLevel';
import { useOutsideClick } from '../hooks/useOutsideClick';
import { useAuth } from '../context/AuthContext';

// Components
import MainLeftMenu from "../components/MainLeftMenu";
import ProfileMenu from "../components/ProfileMenu";
import PinPlacementMenu from "../components/PinPlacementMenu";
import SearchBar from '../components/SearchBar';
import ControlButtons from '../components/ControlButtons';
import GlobeRenderer from '../components/GlobeRenderer';
import LoadingOverlay from '../components/LoadingOverlay';

// Utils
import { getVisibleLabels } from '../utils/globeUtils';

export default function GlobeComponent() {
  const globeEl = useRef();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [hoverD, setHoverD] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);

  // Custom hooks
  const dimensions = useDimensions();
  const { countries, countryLabels } = useGlobeData();
  const showSmallLabels = useZoomLevel(globeEl);
  const { flickerCountry, flickerTick, goToCountry } = useGlobeNavigation(globeEl, countries);
  const { 
    pins, 
    pinMode, 
    setPinMode, 
    pinType, 
    setPinType, 
    handlePolygonClick, 
    removePin, 
    loading: pinsLoading,
    refreshPins
  } = usePinManagement();
  
  const { searchInput, suggestions, handleSearchChange, handleSuggestionClick } = useCountrySearch(
    countryLabels, 
    goToCountry
  );

  useOutsideClick(activePanel, setActivePanel, pinMode);

  // Initialize globe position
  useEffect(() => {
    if (globeEl.current && !globeReady) {
      globeEl.current.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 1000);
      setGlobeReady(true);
    }
  }, [globeReady]);

  // Force refresh pins when user changes or globe becomes ready
  useEffect(() => {
    if (isAuthenticated && user && countries.length > 0) {
      console.log('🔄 User authenticated and countries loaded, refreshing pins...');
      // Small delay to ensure all components are mounted
      const timer = setTimeout(() => {
        refreshPins();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, countries.length]);

  // Debug logging for pin changes
  useEffect(() => {
    console.log('🌍 Globe component - pins updated:', pins?.length || 0, pins);
  }, [pins]);

  // Debug logging for auth changes
  useEffect(() => {
    console.log('🔑 Globe component - auth status:', {
      isAuthenticated,
      user: user?.username,
      pinsCount: pins?.length || 0
    });
  }, [isAuthenticated, user, pins]);

  // Get visible labels based on zoom level
  const visibleLabels = getVisibleLabels(countryLabels, showSmallLabels);

  // Handle pin clicks
  const handlePinClick = (pin) => {
    if (pin.type === 'visited') {
      navigate(`/countries/${encodeURIComponent(pin.country)}`);
    }
  };

  // Show loading only when actually loading pins
  const isLoading = pinsLoading;

  return (
    <div className="globe-wrapper">
      <LoadingOverlay 
        loading={pinsLoading} 
        message="Loading your travel pins..." 
      />
      
      <MainLeftMenu
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        pins={pins || []}
        onRemovePin={removePin}
      />
      
      <SearchBar
        searchInput={searchInput}
        suggestions={suggestions}
        onSearchChange={handleSearchChange}
        onSuggestionClick={handleSuggestionClick}
      />

      <ControlButtons 
        activePanel={activePanel}
        setActivePanel={setActivePanel}
      />

      <ProfileMenu activePanel={activePanel} />

      <PinPlacementMenu
        activePanel={activePanel}
        pinMode={pinMode}
        setPinMode={setPinMode}
        pinType={pinType}
        setPinType={setPinType}
        pins={pins || []}
        onRemovePin={removePin}
      />

      <GlobeRenderer
        globeEl={globeEl}
        dimensions={dimensions}
        countries={countries}
        visibleLabels={visibleLabels}
        pins={pins || []} // Ensure it's always an array
        hoverD={hoverD}
        setHoverD={setHoverD}
        flickerCountry={flickerCountry}
        flickerTick={flickerTick}
        onPolygonClick={handlePolygonClick}
        onPinClick={handlePinClick}
        key={`globe-${user?._id || 'guest'}-${pins?.length || 0}`} // Force re-render when user or pins change
      />
    </div>
  );
}