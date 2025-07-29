import { useState, useEffect } from 'react';
import { getCentroid } from '../utils/globeUtils';
import { useAuth } from '../context/AuthContext';
import API from '../api';

export const usePinManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const [pins, setPins] = useState([]);
  const [pinMode, setPinMode] = useState(false);
  const [pinType, setPinType] = useState('visited');
  const [loading, setLoading] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Fetch pins from backend when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && !hasInitialLoad) {
      console.log('🎯 Initial pin fetch for user:', user.username);
      fetchPins();
    } else if (!isAuthenticated) {
      // Clear pins when user logs out
      console.log('❌ User not authenticated, clearing pins');
      setPins([]);
      setHasInitialLoad(false);
    }
  }, [isAuthenticated, user]);

  const fetchPins = async () => {
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, cannot fetch pins');
      return;
    }

    try {
      console.log('🔄 Fetching pins for authenticated user:', user?.username);
      setLoading(true);
      const response = await API.get('/pins');
      console.log('✅ Pins fetched:', response.data);
      setPins(response.data);
      setHasInitialLoad(true);
    } catch (error) {
      console.error('❌ Error fetching pins:', error);
      if (error.response?.status === 401) {
        console.log('🔑 Authentication expired, please login again');
      }
    } finally {
      setLoading(false);
    }
  };

  // Save pin to backend
  const savePin = async (pinData) => {
    if (!isAuthenticated) {
      throw new Error('Must be authenticated to save pins');
    }

    try {
      console.log('💾 Saving pin to backend:', pinData);
      const response = await API.post('/pins', pinData);
      console.log('✅ Pin saved successfully:', response.data);
      return response.data.pin;
    } catch (error) {
      console.error('❌ Error saving pin:', error);
      throw error;
    }
  };

  // Delete pin from backend
  const deletePin = async (pinId) => {
    if (!isAuthenticated) {
      throw new Error('Must be authenticated to delete pins');
    }

    try {
      console.log('🗑️ Deleting pin from backend:', pinId);
      await API.delete(`/pins/${pinId}`);
      console.log('✅ Pin deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting pin:', error);
      throw error;
    }
  };

  // Function to remove a pin
  const removePin = async (pinToRemove) => {
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, cannot remove pins');
      return;
    }

    try {
      console.log('🗑️ Removing pin:', pinToRemove);
      
      // Remove from local state immediately for better UX
      setPins(prevPins => 
        prevPins.filter(pin => pin._id !== pinToRemove._id)
      );

      // Delete from backend
      if (pinToRemove._id) {
        await deletePin(pinToRemove._id);
      }
    } catch (error) {
      console.error('❌ Error removing pin:', error);
      // Restore pin to local state if backend deletion failed
      setPins(prevPins => [...prevPins, pinToRemove]);
      alert('Failed to delete pin. Please try again.');
    }
  };

  const handlePolygonClick = async (polygon) => {
    console.log('🖱️ Polygon clicked:', polygon.properties?.name, 'pinMode:', pinMode);
    
    if (!pinMode) {
      console.log('❌ Pin mode is OFF - cannot place pins');
      return;
    }

    if (!isAuthenticated) {
      console.log('❌ Not authenticated - cannot place pins');
      alert('Please login to place pins on the map');
      return;
    }
    
    const countryName = polygon.properties.name;
    console.log('🌍 Country:', countryName);
    
    const centroid = getCentroid(polygon);
    console.log('📍 Calculated centroid:', centroid);

    if (!centroid || !centroid.lat || !centroid.lng) {
      console.error('❌ Invalid centroid calculated for', countryName);
      return;
    }

    try {
      // Create new pin data
      const newPinData = {
        lat: centroid.lat,
        lng: centroid.lng,
        type: pinType,
        country: countryName,
      };

      console.log('📌 Creating pin with data:', newPinData);

      // First, add pin to local state immediately for instant feedback
      const tempPin = {
        ...newPinData,
        _id: `temp_${Date.now()}`,
        isTemp: true,
        user: user._id
      };

      console.log('⚡ Adding temporary pin to local state:', tempPin);

      // Remove any existing pin for this country and add the new temporary one
      setPins((prevPins) => {
        const filtered = prevPins.filter((pin) => pin.country !== countryName);
        const newPins = [...filtered, tempPin];
        console.log('📊 Updated pins array:', newPins);
        return newPins;
      });

      // Now try to save to backend
      try {
        const savedPin = await savePin(newPinData);
        console.log('💾 Pin saved to backend, replacing temp pin');
        
        // Replace temporary pin with saved pin
        setPins((prevPins) => 
          prevPins.map(pin => 
            pin._id === tempPin._id ? savedPin : pin
          )
        );
      } catch (backendError) {
        console.error('❌ Backend save failed, keeping temporary pin');
        
        // Mark the temporary pin as unsaved
        setPins((prevPins) => 
          prevPins.map(pin => 
            pin._id === tempPin._id ? { ...pin, unsaved: true } : pin
          )
        );
        
        // Show user-friendly error
        if (backendError.response?.status === 401) {
          alert('Your session has expired. Please login again.');
        } else {
          console.log('Pin placed locally but not saved to server. It will be lost on refresh.');
        }
      }

    } catch (error) {
      console.error('❌ Unexpected error in handlePolygonClick:', error);
      alert(`Failed to place pin on ${countryName}. Please try again.`);
    }
  };

  // Update pin (for future use)
  const updatePin = async (pinId, updateData) => {
    if (!isAuthenticated) {
      throw new Error('Must be authenticated to update pins');
    }

    try {
      console.log('📝 Updating pin:', pinId, updateData);
      const response = await API.put(`/pins/${pinId}`, updateData);
      
      // Update local state
      setPins(prevPins => 
        prevPins.map(pin => 
          pin._id === pinId ? response.data.pin : pin
        )
      );
      
      return response.data.pin;
    } catch (error) {
      console.error('❌ Error updating pin:', error);
      throw error;
    }
  };

  // Get travel statistics
  const getStats = async () => {
    if (!isAuthenticated) {
      return null;
    }

    try {
      const response = await API.get('/pins/stats');
      return response.data.stats;
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      return null;
    }
  };

  // Manual refresh function
  const refreshPins = () => {
    if (!isAuthenticated) return;
    console.log('🔄 Manual pin refresh requested');
    fetchPins();
  };

  // Debug: Log pins state changes
  useEffect(() => {
    console.log('📊 Pins state updated. Total pins:', pins.length);
  }, [pins]);

  // Debug: Log pinMode changes
  useEffect(() => {
    console.log('🔧 Pin mode changed to:', pinMode);
  }, [pinMode]);

  return {
    pins,
    pinMode,
    setPinMode,
    pinType,
    setPinType,
    handlePolygonClick,
    removePin,
    updatePin,
    getStats,
    loading,
    fetchPins,
    refreshPins,
    isAuthenticated
  };
};