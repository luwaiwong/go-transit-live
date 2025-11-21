'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Dynamically import TransitMap with no SSR
const TransitMap = dynamic(() => import('../components/TransitMap'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Loading map...</p>
            </div>
        </div>
    ),
});

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

interface Service {
    Colour: string;
    Direction: 'N' | 'S' | 'E' | 'W';
    Code: string;
    StartTime: string;
    EndTime: string;
    Duration: string;
    Accessible: 'R' | 'B' | 'RB';
    TripHash: string;
    TransferCount: number;
    Trips: {
        trip: Array<{
            Number: string;
            Display: string;
            Line: string;
            Direction: 'N' | 'S' | 'E' | 'W';
            Type: 'T' | 'B';
        }>;
    };
}

interface Journey {
    From: string;
    To: string;
    Services: Service[];
}

export default function Index() {
    const [selectedStop, setSelectedStop] = useState<StopDetails | null>(null);
    const [stops, setStops] = useState<Stop[]>([]);
    const [fromStop, setFromStop] = useState('');
    const [toStop, setToStop] = useState('');
    const [journeys, setJourneys] = useState<Journey[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchFrom, setSearchFrom] = useState('');
    const [searchTo, setSearchTo] = useState('');
    const [showFromDropdown, setShowFromDropdown] = useState(false);
    const [showToDropdown, setShowToDropdown] = useState(false);
    const [viewMode, setViewMode] = useState<'now' | 'day'>('now');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        // Fetch all stops
        const fetchStops = async () => {
            try {
                const response = await fetch('/api/stops');
                const data = await response.json();
                if (Array.isArray(data)) {
                    setStops(data);
                }
            } catch (error) {
                console.error('Error fetching stops:', error);
            }
        };

        fetchStops();
    }, []);

    const handleStopClick = (stop: StopDetails) => {
        setSelectedStop(stop);
        setSearchFrom(stop.LocationName);
        setFromStop(stop.LocationCode);
    };

    const handleSearch = async () => {
        if (!fromStop || !toStop) {
            alert('Please select both origin and destination stations');
            return;
        }

        if (fromStop === toStop) {
            alert('Origin and destination must be different');
            return;
        }

        setLoading(true);
        try {
            const fullDay = viewMode === 'day';
            const response = await fetch(
                `/api/journey?from=${fromStop}&to=${toStop}&fullDay=${fullDay}`
            );
            const data = await response.json();
            setJourneys(data || []);
        } catch (error) {
            console.error('Error fetching journeys:', error);
            setJourneys([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredFromStops = stops.filter((stop) =>
        stop.LocationName.toLowerCase().includes(searchFrom.toLowerCase())
    );

    const filteredToStops = stops.filter((stop) =>
        stop.LocationName.toLowerCase().includes(searchTo.toLowerCase())
    );

    const formatTime = (timeStr: string) => {
        try {
            const date = new Date(timeStr.replace(' ', 'T'));
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
        } catch {
            return timeStr;
        }
    };

    const parseDuration = (durationStr: string) => {
        const parts = durationStr.split(':');
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    return (
        <div className="h-screen flex bg-gray-100">
            {/* Left Sidebar */}
            <div className={`bg-white shadow-lg transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-96'} border-r-4 border-blue-600`}>
                {/* Header */}
                <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
                    {!sidebarCollapsed && (
                        <div>
                            <h1 className="text-xl font-bold">GO Transit Live</h1>
                            <p className="text-xs text-blue-100">Real-time tracking</p>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="text-white hover:bg-blue-700 p-2 rounded"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {sidebarCollapsed ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Sidebar Content */}
                {!sidebarCollapsed && (
                    <div className="flex-1 overflow-y-auto">
                        {/* Trip Planner */}
                        <div className="p-4 border-b">
                            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                Plan Your Trip
                            </h2>

                            <div className="space-y-3">
                                {/* From Station */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        From
                                    </label>
                                    <input
                                        type="text"
                                        value={searchFrom}
                                        onChange={(e) => {
                                            setSearchFrom(e.target.value);
                                            setShowFromDropdown(true);
                                        }}
                                        onFocus={() => setShowFromDropdown(true)}
                                        placeholder="Origin station..."
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {showFromDropdown && filteredFromStops.length > 0 && (
                                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {filteredFromStops.slice(0, 8).map((stop) => (
                                                <button
                                                    key={stop.LocationCode}
                                                    onClick={() => {
                                                        setFromStop(stop.LocationCode);
                                                        setSearchFrom(stop.LocationName);
                                                        setShowFromDropdown(false);
                                                    }}
                                                    className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-0"
                                                >
                                                    <div className="font-medium text-sm">{stop.LocationName}</div>
                                                    <div className="text-xs text-gray-500">{stop.LocationCode}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* To Station */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        To
                                    </label>
                                    <input
                                        type="text"
                                        value={searchTo}
                                        onChange={(e) => {
                                            setSearchTo(e.target.value);
                                            setShowToDropdown(true);
                                        }}
                                        onFocus={() => setShowToDropdown(true)}
                                        placeholder="Destination station..."
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {showToDropdown && filteredToStops.length > 0 && (
                                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {filteredToStops.slice(0, 8).map((stop) => (
                                                <button
                                                    key={stop.LocationCode}
                                                    onClick={() => {
                                                        setToStop(stop.LocationCode);
                                                        setSearchTo(stop.LocationName);
                                                        setShowToDropdown(false);
                                                    }}
                                                    className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-0"
                                                >
                                                    <div className="font-medium text-sm">{stop.LocationName}</div>
                                                    <div className="text-xs text-gray-500">{stop.LocationCode}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* View Mode */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Time Range
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setViewMode('now')}
                                            className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                                                viewMode === 'now'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            Next
                                        </button>
                                        <button
                                            onClick={() => setViewMode('day')}
                                            className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                                                viewMode === 'day'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            Full Day
                                        </button>
                                    </div>
                                </div>

                                {/* Search Button */}
                                <button
                                    onClick={handleSearch}
                                    disabled={loading || !fromStop || !toStop}
                                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                                >
                                    {loading ? 'Searching...' : 'Find Trips'}
                                </button>
                            </div>
                        </div>

                        {/* Journey Results */}
                        {journeys.length > 0 && (
                            <div className="p-4 border-b">
                                <h3 className="text-sm font-bold mb-3">
                                    {journeys.length} Trip{journeys.length !== 1 ? 's' : ''} Found
                                </h3>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {journeys.map((journey, index) => {
                                        const service = journey.Services[0];
                                        const trip = service.Trips.trip[0];

                                        return (
                                            <div
                                                key={index}
                                                className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div
                                                        className="w-1 h-12 rounded-full"
                                                        style={{ backgroundColor: `#${service.Colour}` }}
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-bold text-sm">{trip.Display}</div>
                                                        <div className="text-xs text-gray-600">
                                                            {trip.Type === 'T' ? '🚆 Train' : '🚌 Bus'} • Line {trip.Line}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 text-xs">
                                                    <div>
                                                        <div className="text-gray-500">Departs</div>
                                                        <div className="font-bold text-blue-600">
                                                            {formatTime(service.StartTime)}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 border-t border-dashed border-gray-300" />
                                                    <div className="text-gray-500">
                                                        {parseDuration(service.Duration)}
                                                    </div>
                                                    <div className="flex-1 border-t border-dashed border-gray-300" />
                                                    <div>
                                                        <div className="text-gray-500">Arrives</div>
                                                        <div className="font-bold text-green-600">
                                                            {formatTime(service.EndTime)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {fromStop && toStop && !loading && journeys.length === 0 && (
                            <div className="p-4 text-center text-sm text-gray-600">
                                <p>No direct trips found between these stations.</p>
                            </div>
                        )}

                        {/* Navigation Links */}
                        <div className="p-4">
                            <h3 className="text-sm font-bold mb-2">Quick Links</h3>
                            <div className="space-y-2">
                                <Link
                                    href="/schedule"
                                    className="block px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                                >
                                    View Schedules
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Button */}
                <div className={`p-4 border-t ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
                    <Link
                        href="/settings"
                        className={`flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors ${
                            sidebarCollapsed ? '' : 'w-full'
                        }`}
                        title="Settings"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                        {!sidebarCollapsed && <span className="font-medium">Settings</span>}
                    </Link>
                </div>
            </div>

            {/* Main Content - Map */}
            <div className="flex-1 p-6">
                <div className="h-full bg-white rounded-xl shadow-lg border-4 border-gray-300 overflow-hidden">
                    <TransitMap onStopClick={handleStopClick} />
                </div>
            </div>
        </div>
    );
}
