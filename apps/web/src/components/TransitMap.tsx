'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Stop {
    LocationCode: string;
    LocationName: string;
    LocationType: string;
    PublicStopID: string;
}

interface StopDetails extends Stop {
    Latitude: string;
    Longitude: string;
    IsBus: boolean;
    IsTrain: boolean;
}

interface VehiclePosition {
    id: string;
    vehicle: {
        trip?: {
            routeId: string;
            tripId: string;
        };
        position?: {
            latitude: number;
            longitude: number;
            bearing?: number;
        };
        vehicle?: {
            id: string;
            label?: string;
        };
    };
}

// Fix Leaflet default marker icon issue with Next.js
const fixLeafletIcons = () => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
};

// Create custom icons for trains and stations
const trainIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="12" fill="#00A850" stroke="white" stroke-width="3"/>
            <circle cx="16" cy="16" r="6" fill="white"/>
        </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
});

const stationIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" fill="#0066CC" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="12" r="4" fill="white"/>
        </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
});

const highlightedStationIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="12" fill="#FF6B00" stroke="white" stroke-width="3"/>
            <circle cx="16" cy="16" r="6" fill="white"/>
        </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
});

interface TransitMapProps {
    highlightedStops?: string[];
    onStopClick?: (stop: StopDetails) => void;
}

export default function TransitMap({ highlightedStops = [], onStopClick }: TransitMapProps) {
    const [stops, setStops] = useState<StopDetails[]>([]);
    const [vehicles, setVehicles] = useState<VehiclePosition[]>([]);
    const [loading, setLoading] = useState(true);
    const mapInitialized = useRef(false);

    useEffect(() => {
        if (!mapInitialized.current) {
            fixLeafletIcons();
            mapInitialized.current = true;
        }
    }, []);

    useEffect(() => {
        // Fetch stops with location data
        const fetchStopsData = async () => {
            try {
                const response = await fetch('/api/stops');
                const allStops: Stop[] = await response.json();

                // Fetch details for each stop to get coordinates
                const stopsWithDetails = await Promise.all(
                    allStops.slice(0, 50).map(async (stop) => {
                        try {
                            const detailsResponse = await fetch(`/api/stop-details/${stop.LocationCode}`);
                            const details = await detailsResponse.json();
                            return details;
                        } catch (error) {
                            console.error(`Error fetching details for stop ${stop.LocationCode}:`, error);
                            return null;
                        }
                    })
                );

                const validStops = stopsWithDetails
                    .filter((stop): stop is StopDetails =>
                        stop !== null &&
                        stop.Latitude &&
                        stop.Longitude &&
                        !isNaN(parseFloat(stop.Latitude)) &&
                        !isNaN(parseFloat(stop.Longitude)) &&
                        stop.IsTrain
                    );

                setStops(validStops);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching stops:', error);
                setLoading(false);
            }
        };

        fetchStopsData();
    }, []);

    useEffect(() => {
        // Fetch vehicle positions
        const fetchVehicles = async () => {
            try {
                const response = await fetch('/api/vehicle-positions');
                const data = await response.json();

                if (data && data.entity) {
                    const validVehicles = data.entity.filter((v: VehiclePosition) =>
                        v.vehicle?.position?.latitude &&
                        v.vehicle?.position?.longitude
                    );
                    setVehicles(validVehicles);
                }
            } catch (error) {
                console.error('Error fetching vehicle positions:', error);
            }
        };

        fetchVehicles();

        // Refresh vehicle positions every 30 seconds
        const interval = setInterval(fetchVehicles, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading transit map...</p>
                </div>
            </div>
        );
    }

    // Default center: Toronto Union Station
    const defaultCenter: [number, number] = [43.6426, -79.3871];
    const defaultZoom = 10;

    return (
        <div className="h-full w-full">
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Render stations */}
                {stops.map((stop) => {
                    const lat = parseFloat(stop.Latitude);
                    const lng = parseFloat(stop.Longitude);
                    const isHighlighted = highlightedStops.includes(stop.LocationCode);

                    return (
                        <Marker
                            key={stop.LocationCode}
                            position={[lat, lng]}
                            icon={isHighlighted ? highlightedStationIcon : stationIcon}
                            eventHandlers={{
                                click: () => onStopClick?.(stop),
                            }}
                        >
                            <Popup>
                                <div className="text-sm">
                                    <h3 className="font-bold">{stop.LocationName}</h3>
                                    <p className="text-xs text-gray-600">Station Code: {stop.LocationCode}</p>
                                    {stop.IsTrain && <p className="text-xs text-blue-600">Train Station</p>}
                                    {stop.IsBus && <p className="text-xs text-green-600">Bus Stop</p>}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* Render live vehicle positions */}
                {vehicles.map((vehicle) => {
                    const pos = vehicle.vehicle.position;
                    if (!pos) return null;

                    return (
                        <Marker
                            key={vehicle.id}
                            position={[pos.latitude, pos.longitude]}
                            icon={trainIcon}
                        >
                            <Popup>
                                <div className="text-sm">
                                    <h3 className="font-bold">Train {vehicle.vehicle.vehicle?.label || vehicle.id}</h3>
                                    {vehicle.vehicle.trip && (
                                        <>
                                            <p className="text-xs">Route: {vehicle.vehicle.trip.routeId}</p>
                                            <p className="text-xs">Trip: {vehicle.vehicle.trip.tripId}</p>
                                        </>
                                    )}
                                    {pos.bearing !== undefined && (
                                        <p className="text-xs">Bearing: {pos.bearing}°</p>
                                    )}
                                    {pos.speed !== undefined && (
                                        <p className="text-xs">Speed: {pos.speed.toFixed(1)} m/s</p>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
