import { useState, useEffect } from 'react';
import { getCentroid, countryNameMap, normalizeName } from '../utils/globeUtils';

export const useGlobeNavigation = (globeEl, countries) => {
  const [flickerCountry, setFlickerCountry] = useState(null);
  const [flickerTick, setFlickerTick] = useState(0);

  useEffect(() => {
    let intervalId;
    if (flickerCountry) {
      intervalId = setInterval(() => setFlickerTick(t => t + 1), 100);
    }
    return () => clearInterval(intervalId);
  }, [flickerCountry]);

  const goToCountry = (countryName) => {
    const normalized = countryNameMap[countryName] || countryName;
    const feature = countries.find(f =>
      normalizeName(f.properties.name).includes(normalizeName(normalized))
    );

    if (feature) {
      const { lat, lng } = getCentroid(feature);
      globeEl.current.pointOfView({ lat, lng, altitude: 1.6 }, 1000);
      setFlickerCountry(feature);
      setTimeout(() => setFlickerCountry(null), 3000);
    } else {
      console.warn('Country not found:', countryName);
    }
  };

  return {
    flickerCountry,
    flickerTick,
    goToCountry
  };
};