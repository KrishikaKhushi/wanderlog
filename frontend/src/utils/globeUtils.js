import { geoCentroid } from 'd3-geo';
import * as THREE from 'three';

export const largeCountries = new Set([
  'United States', 'Brazil', 'Russia', 'India', 'Australia', 'Canada', 'China'
]);

export const countryNameMap = {
  'United States': 'United States of America',
  'United Kingdom': 'United Kingdom of Great Britain and Northern Ireland',
  'South Korea': 'Republic of Korea',
  'North Korea': "Democratic People's Republic of Korea",
  'Russia': 'Russian Federation',
  'Iran': 'Islamic Republic of Iran',
  'Vietnam': 'Viet Nam',
  'Syria': 'Syrian Arab Republic',
  'Laos': "Lao People's Democratic Republic"
};

// EXACT SAME AS WORKING VERSION
export const getCentroid = (polygon) => {
  const [lng, lat] = geoCentroid(polygon);
  return { lat, lng };
};

export const normalizeName = name => name.toLowerCase().replace(/[^a-z]/g, '');

// EXACT SAME AS WORKING VERSION - Use external URLs that work
export const createVisitedPin = () => {
  console.log('🔴 Creating visited pin');
  return new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load('https://img.icons8.com/?size=100&id=7880&format=png&color=B41B1B'),
      depthWrite: false,
      depthTest: false,
      transparent: true,
    })
  );
};

export const createDreamPin = () => {
  console.log('🔵 Creating dream pin');
  return new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load('https://img.icons8.com/?size=100&id=7880&format=png&color=61BAFF'),
      depthWrite: false,
      depthTest: false,
      transparent: true,
    })
  );
};

export const getVisibleLabels = (countryLabels, showSmallLabels) => {
  return countryLabels.filter(
    (label) => showSmallLabels || largeCountries.has(label.name)
  );
};