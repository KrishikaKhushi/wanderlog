import { useState, useEffect } from 'react';

export const useGlobeData = () => {
  const [countries, setCountries] = useState([]);
  const [countryLabels, setCountryLabels] = useState([]);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      .then(res => res.json())
      .then(({ features }) => setCountries(features))
      .catch(err => console.error('Error loading countries GeoJSON:', err));
  }, []);

  useEffect(() => {
    fetch('/data/countryLabels.json')
      .then(res => res.json())
      .then(data => setCountryLabels(data))
      .catch(err => console.error('Error loading country labels:', err));
  }, []);

  return { countries, countryLabels };
};