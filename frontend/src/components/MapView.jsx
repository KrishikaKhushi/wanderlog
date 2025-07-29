import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import API from "../api";
import "leaflet/dist/leaflet.css";

const MapView = () => {
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
    <MapContainer
      center={[20, 77]} // Center over India; adjust as needed
      zoom={5}
      style={{ height: "600px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {pins.map((pin) => (
        <Marker key={pin._id} position={[pin.lat, pin.long]}>
          <Popup>
            <strong>{pin.title}</strong>
            <br />
            {pin.desc}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
