import React from 'react';
import './PinPlacementMenu.css';

const PinPlacementMenu = ({ 
  activePanel, 
  pinMode, 
  setPinMode, 
  pinType, 
  setPinType, 
  pins 
}) => {
  if (activePanel !== 'pin') return null;

  return (
    <div className={`pin-slideout ${activePanel === 'pin' ? 'open' : ''}`}>
      <h2>Pin Placement</h2>
      <label>
        <input
          type="checkbox"
          checked={pinMode}
          onChange={() => setPinMode(prev => !prev)}
        /> Enable Pin Drop
      </label>

      <fieldset disabled={!pinMode}>
        <legend>Select Pin Type</legend>
        <label>
          <input
            type="radio"
            name="pinType"
            value="visited"
            checked={pinType === 'visited'}
            onChange={() => setPinType('visited')}
          /> Visited Location
        </label>
        <br />
        <label>
          <input
            type="radio"
            name="pinType"
            value="dream"
            checked={pinType === 'dream'}
            onChange={() => setPinType('dream')}
          /> Dream Destination
        </label>
      </fieldset>

      <p>Click a country on the globe to drop a pin.</p>
      <hr />
      <h4>Pins placed: {pins.length}</h4>
    </div>
  );
};

export default PinPlacementMenu;