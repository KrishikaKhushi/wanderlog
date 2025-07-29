import { useState, useEffect } from 'react';

// Custom hook for location services
const useLocation = () => {
  const [location, setLocation] = useState("Fetching location...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLocation = async () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setLocation("Geolocation not supported");
      setLoading(false);
      return;
    }

    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      const locationData = await reverseGeocode(latitude, longitude);
      setLocation(locationData);
    } catch (err) {
      console.error('Location error:', err);
      setError(err.message);
      
      if (err.code === 1) {
        setLocation("Permission denied");
      } else if (err.code === 2) {
        setLocation("Position unavailable");
      } else if (err.code === 3) {
        setLocation("Request timeout");
      } else {
        setLocation("Location unavailable");
      }
    } finally {
      setLoading(false);
    }
  };

  // Get current position as a Promise
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes cache
        }
      );
    });
  };

  // Reverse geocoding to get location name
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        {
          headers: {
            'User-Agent': 'WanderLog-App/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();
      
      if (!data || !data.address) {
        throw new Error('Invalid geocoding response');
      }

      const address = data.address;
      const city = address.city || 
                   address.town || 
                   address.village || 
                   address.municipality || 
                   address.county ||
                   "Your Area";
      
      const country = address.country || "";
      const state = address.state || address.region || "";

      // Format location string
      if (country && state && city !== state) {
        return `${city}, ${state}, ${country}`;
      } else if (country) {
        return `${city}, ${country}`;
      } else {
        return city;
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error('Failed to get location name');
    }
  };

  // Initialize location on mount
  useEffect(() => {
    fetchLocation();
  }, []);

  return {
    location,
    loading,
    error,
    refetch: fetchLocation
  };
};

// Location Service Component
const LocationService = ({ onLocationChange, children }) => {
  const { location, loading, error, refetch } = useLocation();

  // Notify parent component of location changes
  useEffect(() => {
    if (onLocationChange && !loading) {
      onLocationChange(location, error);
    }
  }, [location, loading, error, onLocationChange]);

  // If children are provided, render them with location data
  if (children) {
    return children({ location, loading, error, refetch });
  }

  // Default render - just return location string
  return location;
};

export default LocationService;
export { useLocation };