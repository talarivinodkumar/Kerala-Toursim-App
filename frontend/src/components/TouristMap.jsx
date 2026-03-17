import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Popup, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { toast } from 'react-toastify';

// Fix icon paths for webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// For tourist location, let's use a custom blue circle icon
const touristIcon = new L.DivIcon({
    className: 'tourist-marker',
    html: '<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

const defaultCenter = {
    lat: 10.1416,
    lng: 76.1783 // Cherai Beach
};

// Kerala state center to view all beaches
const keralaCenter = {
    lat: 10.35,
    lng: 76.25
};

const keralaBounds = [
    [8.0, 74.5], // SouthWest
    [13.0, 77.8] // NorthEast
];

const getZoneColor = (type) => {
    switch (type) {
        case 'danger': return '#ef4444';
        case 'warning': return '#eab308';
        case 'safe': return '#22c55e';
        default: return '#3b82f6';
    }
};

const TouristMap = ({ tourist, onZoneUpdate }) => {
    const [beaches, setBeaches] = useState([]);
    const [touristLocation, setTouristLocation] = useState(null);
    const posRef = useRef(null);

    // If tourist is null (Admin Dashboard), zoom out to show the whole state.
    const initialCenter = tourist ? defaultCenter : keralaCenter;
    const initialZoom = tourist ? 15 : 7;

    const checkBeaches = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/safety/beaches');
            setBeaches(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        checkBeaches();

        // Setup mock geolocation tracking
        const interval = setInterval(async () => {
            let newLat = defaultCenter.lat + (Math.random() - 0.5) * 0.005;
            let newLng = defaultCenter.lng + (Math.random() - 0.5) * 0.005;

            if (posRef.current) {
                newLat = posRef.current.lat + (Math.random() - 0.5) * 0.0005;
                newLng = posRef.current.lng + (Math.random() - 0.5) * 0.0005;
            } else if (tourist?.current_lat) {
                newLat = parseFloat(tourist.current_lat);
                newLng = parseFloat(tourist.current_lng);
            }

            const updatedLocation = { lat: newLat, lng: newLng };
            setTouristLocation(updatedLocation);
            posRef.current = updatedLocation;

            // Only sync location to DB if we're actively tracking a tourist
            if (tourist && tourist.id) {
                try {
                    // NEW: Full Geo-Fence & Risk Assessment Flow
                    // "Tourist opens app -> GPS -> Beach -> Geo-Fence -> Risk -> Alert"
                    const autoTrackRes = await axios.post('http://localhost:5000/api/safety/auto-track', {
                        tourist_id: tourist.id,
                        lat: newLat,
                        lng: newLng,
                        battery_level: Math.floor(Math.random() * 80) + 20 // Simulate battery drop
                    });

                    const data = autoTrackRes.data;

                    if (data.zone && data.zone.zone_type) {
                        toast(`Alert: You are inside a ${data.zone.zone_type} zone near ${data.nearest_beach?.beach_name}!`, {
                            type: data.zone.zone_type === 'danger' ? 'error' : 'warning',
                            autoClose: 3000,
                            toastId: data.zone.zone_type
                        });
                        if (onZoneUpdate) onZoneUpdate(data.zone.zone_type, data.tourist_status, data.risk_score);
                    } else {
                        if (onZoneUpdate) onZoneUpdate('safe', data.tourist_status || 'safe', data.risk_score || 0);
                    }
                } catch (e) { console.error('auto-track error', e) }
            }
        }, 8000);

        return () => clearInterval(interval);
    }, [tourist]);

    return (
        <div className="relative rounded-2xl shadow-2xl" style={{ isolation: 'isolate' }}>
            <div className="absolute top-4 left-4 z-[1000] bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-white text-sm font-semibold shadow-lg">
                🔴 {tourist ? "Live Tracking Active" : "State-Wide Safety Map Visualization"}
            </div>
            <MapContainer
                center={[initialCenter.lat, initialCenter.lng]}
                zoom={initialZoom}
                minZoom={7}
                maxBounds={keralaBounds}
                maxBoundsViscosity={1.0}
                style={{ height: '400px', width: '100%', borderRadius: '16px', zIndex: 1 }}
                attributionControl={false}
            >
                {/* Free open-source beautiful dark maps using CartoCDN avoiding any API Key requirement screens */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Render Zones / Geo-Fences */}
                {beaches.map(beach => (
                    beach.zones.map(zone => (
                        <Circle
                            key={zone.id}
                            center={[parseFloat(zone.lat), parseFloat(zone.lng)]}
                            radius={zone.radius}
                            pathOptions={{
                                fillColor: getZoneColor(zone.type),
                                fillOpacity: 0.25,
                                color: getZoneColor(zone.type),
                                weight: 2,
                            }}
                        >
                            <Popup>
                                <div className="text-gray-900 pb-2">
                                    <h4 className="font-bold text-sm uppercase m-0 leading-tight pb-1">{zone.name}</h4>
                                    <p className="text-xs m-0">Type: <span className="font-semibold uppercase">{zone.type}</span></p>
                                    <p className="text-xs m-0">Radius: {zone.radius}m</p>
                                    <p className="text-xs text-gray-500 m-0 mt-1 pb-1 border-b border-gray-200">Beach: {beach.name}</p>
                                </div>
                            </Popup>
                        </Circle>
                    ))
                ))}

                {/* Live Tourist Marker */}
                {touristLocation && tourist && (
                    <Marker
                        position={[touristLocation.lat, touristLocation.lng]}
                        icon={touristIcon}
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default React.memo(TouristMap);
