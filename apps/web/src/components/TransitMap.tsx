'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
            speed?: number;
        };
        vehicle?: {
            id: string;
            label?: string;
        };
    };
}

// Helper function to convert bearing to compass direction
const getDirectionFromBearing = (bearing: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
};

// Fix Leaflet default marker icon issue with Next.js
const fixLeafletIcons = () => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
};

// Create custom icons for trains, buses and stations
const trainIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="12" fill="#00A850" stroke="white" stroke-width="3"/>
            <text x="16" y="21" font-family="Arial" font-size="14" font-weight="bold" fill="white" text-anchor="middle">T</text>
        </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
});

const busIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <rect x="4" y="8" width="24" height="16" rx="3" fill="#FF6B00" stroke="white" stroke-width="3"/>
            <text x="16" y="21" font-family="Arial" font-size="14" font-weight="bold" fill="white" text-anchor="middle">B</text>
        </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
});

const trainStationIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" fill="#0066CC" stroke="white" stroke-width="2"/>
            <text x="12" y="15.5" font-family="Arial" font-size="10" font-weight="bold" fill="white" text-anchor="middle">T</text>
        </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
});

const busStopIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" rx="2" fill="#FF6B00" stroke="white" stroke-width="2"/>
            <text x="12" y="15.5" font-family="Arial" font-size="10" font-weight="bold" fill="white" text-anchor="middle">B</text>
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
                const allStops: Stop[] | { error: string } = await response.json();

                // Validate that allStops is an array
                if (!Array.isArray(allStops)) {
                    console.error('Invalid stops data received:', allStops);
                    setLoading(false);
                    return;
                }

                // Check if API returned empty data
                if (allStops.length === 0) {
                    console.warn('⚠️ No stops received from API. This could be due to:');
                    console.warn('  1. Network connectivity issues');
                    console.warn('  2. API key not configured (check .env.local)');
                    console.warn('  3. Metrolinx API is down');
                    setLoading(false);
                    return;
                }

                // Fetch details for each stop to get coordinates
                // Increased limit and show both train and bus stations
                const stopsWithDetails = await Promise.all(
                    allStops.slice(0, 100).map(async (stop) => {
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
                        !isNaN(parseFloat(stop.Longitude))
                        // Show all stops (both train and bus)
                    );

                // Log station type breakdown for debugging
                const trainStations = validStops.filter(s => s.IsTrain && !s.IsBus);
                const busStops = validStops.filter(s => s.IsBus && !s.IsTrain);
                const mixedStops = validStops.filter(s => s.IsBus && s.IsTrain);
                const unknownStops = validStops.filter(s => !s.IsBus && !s.IsTrain);

                console.log(`Loaded ${validStops.length} stations on map:`,
                    `${trainStations.length} train stations,`,
                    `${busStops.length} bus stops,`,
                    `${mixedStops.length} mixed,`,
                    `${unknownStops.length} unknown`);

                if (trainStations.length > 0) {
                    console.log('Sample train stations:', trainStations.slice(0, 3).map(s => ({
                        name: s.LocationName,
                        code: s.LocationCode,
                        type: s.LocationType,
                        isTrain: s.IsTrain,
                        isBus: s.IsBus
                    })));
                }

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

    // Show message if no stops loaded
    if (stops.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md p-6">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-bold mb-2 text-gray-700">No Station Data Available</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Unable to load GO Transit station data. This may be due to:
                    </p>
                    <ul className="text-xs text-gray-500 text-left list-disc list-inside space-y-1">
                        <li>Network connectivity issues</li>
                        <li>Metrolinx API is temporarily unavailable</li>
                        <li>Missing or invalid API key configuration</li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-4">
                        Check the browser console for more details.
                    </p>
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

                    // Choose icon based on type
                    let icon;
                    if (isHighlighted) {
                        icon = highlightedStationIcon;
                    } else if (stop.IsTrain && !stop.IsBus) {
                        // Train-only station
                        icon = trainStationIcon;
                    } else if (stop.IsBus && !stop.IsTrain) {
                        // Bus-only stop
                        icon = busStopIcon;
                    } else {
                        // Mixed or default - use train icon
                        icon = trainStationIcon;
                    }

                    return (
                        <Marker
                            key={stop.LocationCode}
                            position={[lat, lng]}
                            icon={icon}
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

                    const vehicleLabel = vehicle.vehicle.vehicle?.label || vehicle.vehicle.vehicle?.id || vehicle.id;
                    const routeName = vehicle.vehicle.trip?.routeId;
                    const speedKmh = pos.speed !== undefined ? (pos.speed * 3.6).toFixed(0) : null;

                    // Determine if it's a bus or train based on route ID digit count
                    // Route number is the last part of the route ID
                    // Trains have 4-digit route IDs, buses have 5-digit route IDs
                    const extractDigits = (id: string) => id?.match(/\d+$/)?.[0] || '';
                    const routeDigits = extractDigits(routeName || '');
                    const isBus = routeDigits.length === 5;
                    const vehicleIcon = isBus ? busIcon : trainIcon;
                    const vehicleType = isBus ? 'Bus' : 'Train';

                    // Debug logging to verify classification
                    if (routeName) {
                        console.log(`Vehicle ${vehicleLabel}: RouteID="${routeName}", Digits="${routeDigits}" (${routeDigits.length}), Type=${vehicleType}`);
                    }

                    return (
                        <Marker
                            key={vehicle.id}
                            position={[pos.latitude, pos.longitude]}
                            icon={vehicleIcon}
                        >
                            <Popup>
                                <div className="text-sm min-w-[200px]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`${isBus ? 'bg-orange-500' : 'bg-green-500'} text-white rounded-full w-6 h-6 flex items-center justify-center text-xs`}>
                                            {isBus ? 'B' : 'T'}
                                        </div>
                                        <h3 className="font-bold text-base">{vehicleType} {vehicleLabel}</h3>
                                    </div>
                                    {routeName && (
                                        <div className="mb-2 p-2 bg-blue-50 rounded">
                                            <p className="text-xs text-gray-600">Route</p>
                                            <p className="font-semibold text-blue-700">{routeName}</p>
                                        </div>
                                    )}
                                    <div className="space-y-1 text-xs text-gray-600">
                                        {speedKmh !== null && (
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                </svg>
                                                <span><strong>Speed:</strong> {speedKmh} km/h</span>
                                            </div>
                                        )}
                                        {pos.bearing !== undefined && (
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                <span><strong>Heading:</strong> {pos.bearing}° {getDirectionFromBearing(pos.bearing)}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            <span><strong>Position:</strong> {pos.latitude.toFixed(4)}, {pos.longitude.toFixed(4)}</span>
                                        </div>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                                        Live tracking data
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
