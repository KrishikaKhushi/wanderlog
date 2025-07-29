import React, { useEffect } from 'react';
import Globe from 'react-globe.gl';
import { createVisitedPin, createDreamPin } from '../utils/globeUtils';
import './GlobeRenderer.css';

const GlobeRenderer = ({
  globeEl,
  dimensions,
  countries,
  visibleLabels,
  pins,
  hoverD,
  setHoverD,
  flickerCountry,
  flickerTick,
  onPolygonClick,
  onPinClick
}) => {
  
  useEffect(() => {
    console.log('🌐 GlobeRenderer received pins:', pins?.length || 0, pins);
  }, [pins]);

  // FIXED: Proper pin ID handling to prevent NaN
  const customThreeObjectUpdate = (obj, pin) => {
    if (!globeEl.current) return;
    const { lat, lng } = pin;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = lng * (Math.PI / 180);
    const baseRadius = globeEl.current.getGlobeRadius() * 1.05;
    const time = Date.now() * 0.001;
    
    // FIXED: Convert MongoDB ObjectId to usable number
    let pinId = 0;
    if (pin._id) {
      // Convert MongoDB ObjectId to number
      pinId = parseInt(pin._id.toString().slice(-8), 16);
    } else if (pin.id) {
      pinId = pin.id;
    } else {
      // Fallback: use country name hash
      pinId = pin.country ? pin.country.length * 1000 : Math.random() * 1000;
    }
    
    console.log('🎯 Pin animation - pinId:', pinId, 'type:', typeof pinId);
    
    const floatHeight = Math.sin(time + pinId) * 0.3 + 1.0;
    const radius = baseRadius + floatHeight * 0.02;
    obj.position.setFromSphericalCoords(radius, phi, theta);
    
    // FIXED: Ensure scale is always a valid number - Made smaller
    const scalePulse = 15 + 3 * Math.sin(time + pinId);
    const finalScale = isNaN(scalePulse) ? 15 : scalePulse;
    
    obj.scale.set(finalScale, finalScale, 1);
    obj.material.rotation = 0;
    obj.material.opacity = 1.0;
    
    console.log(`🎯 Updating pin at lat:${lat}, lng:${lng}, pinId:${pinId}, scale:${finalScale}`);
  };

  const getPolygonStrokeColor = (d) => {
    if (flickerCountry && d.properties.name === flickerCountry.properties.name) {
      const time = flickerTick % 6;
      return time < 2 ? 'red' : 'rgba(255,255,255,0.8)';
    }
    return d === hoverD ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)';
  };

  const handlePolygonClick = (polygon, event) => {
    console.log('🌐 Globe polygon clicked:', polygon?.properties?.name);
    if (onPolygonClick) {
      onPolygonClick(polygon, event);
    }
  };

  const handlePinClick = (pin, event) => {
    console.log('📌 Pin clicked on globe:', pin);
    if (onPinClick) {
      onPinClick(pin, event);
    }
  };

  const createCustomThreeObject = (pin) => {
    console.log('🎨 Creating ULTRA VISIBLE 3D object for pin:', pin);
    const sprite = pin.type === 'dream' ? createDreamPin() : createVisitedPin();
    
    // Ensure the sprite is visible
    if (sprite && sprite.material) {
      sprite.material.opacity = 1.0;
      sprite.material.transparent = true;
      sprite.material.depthWrite = false;
      sprite.material.depthTest = false;
    }
    
    return sprite;
  };

  return (
    <div className="globe-container">
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        showAtmosphere
        atmosphereColor="rgba(135, 192, 252, 0.5)"
        atmosphereAltitude={0.3}
        polygonsData={countries}
        polygonStrokeColor={getPolygonStrokeColor}
        polygonAltitude={(d) => (d === hoverD ? 0.02 : 0.01)}
        polygonCapColor={(d) =>
          d === hoverD ? 'rgba(255, 255, 224, 0.5)' : 'rgba(255, 255, 224, 0.15)'
        }
        labelsData={visibleLabels}
        labelLat={(d) => d.lat}
        labelLng={(d) => d.lng}
        labelText={(d) => d.name}
        labelSize={1.5}
        labelColor={() => 'rgba(255, 255, 255, 0.9)'}
        labelAltitude={0.015}
        labelResolution={2}
        customLayerData={pins || []}
        customThreeObject={createCustomThreeObject}
        customThreeObjectUpdate={customThreeObjectUpdate}
        onPolygonClick={handlePolygonClick}
        onCustomLayerClick={handlePinClick}
        onPolygonHover={setHoverD}
        enablePointerInteraction
      />
    </div>
  );
};

export default GlobeRenderer;