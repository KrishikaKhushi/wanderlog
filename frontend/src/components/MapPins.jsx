import React, { useEffect, useState } from "react";
import API from "../api";

const MapPins = () => {
  const [pins, setPins] = useState([]);

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const res = await API.get("/pins");
        setPins(res.data);
      } catch (err) {
        console.error("Error fetching pins:", err);
      }
    };

    fetchPins();
  }, []);

  return (
    <div>
      <h2>Pins List:</h2>
      <ul>
        {pins.map((pin) => (
          <li key={pin._id}>
            📍 {pin.title} ({pin.lat}, {pin.long})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MapPins;
