'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '../../contexts/ThemeContext';

interface Stop {
    LocationCode: string;
    LocationName: string;
    LocationType: string;
    PublicStopID: string;
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

export default function NavigatePage() {
    const { theme } = useTheme();
    const [stops, setStops] = useState<Stop[]>([]);
    const [fromStop, setFromStop] = useState('');
    const [toStop, setToStop] = useState('');
    const [journeys, setJourneys] = useState<Journey[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchFrom, setSearchFrom] = useState('');
    const [searchTo, setSearchTo] = useState('');
    const [showFromDropdown, setShowFromDropdown] = useState(false);
    const [showToDropdown, setShowToDropdown] = useState(false);
    const [viewMode, setViewMode] = useState<'now' | 'day'>('now');

    useEffect(() => {
        // Fetch all stops
        const fetchStops = async () => {
            try {
                const response = await fetch('/api/stops');
                const data = await response.json();
                setStops(data);
            } catch (error) {
                console.error('Error fetching stops:', error);
            }
        };

        fetchStops();
    }, []);

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
        setError(null);
        try {
            const fullDay = viewMode === 'day';
            const response = await fetch(
                `/api/journey?from=${fromStop}&to=${toStop}&fullDay=${fullDay}`
            );
            const data = await response.json();

            // Check if response is an error
            if (data.error) {
                console.error('API Error:', data.error, data.details);
                setError(data.details || data.error);
                setJourneys([]);
            } else {
                setJourneys(Array.isArray(data) ? data : []);
                setError(null);
            }
        } catch (error) {
            console.error('Error fetching journeys:', error);
            setError('Failed to connect to the server. Please try again.');
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
        // Duration format: "HH:MM:SS"
        const parts = durationStr.split(':');
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    return (
        <div className="h-screen flex flex-col" style={{ backgroundColor: theme.colors.background }}>
            {/* Header */}
            <header className="text-white p-4 shadow-md" style={{ backgroundColor: theme.colors.primary }}>
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold">GO Transit - Trip Planner</h1>
                    <nav className="flex gap-4">
                        <Link href="/" className="hover:underline">
                            Map
                        </Link>
                        <Link href="/schedule" className="hover:underline">
                            Schedule
                        </Link>
                        <Link href="/settings" className="hover:underline">
                            Settings
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-6 max-w-4xl">
                    {/* Search Form */}
                    <div className="rounded-lg shadow-md p-6 mb-6" style={{ backgroundColor: theme.colors.surface }}>
                        <h2 className="text-xl font-bold mb-4" style={{ color: theme.colors.text }}>Plan Your Journey</h2>
                        <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>
                            Find direct trips between stations (same line only, no transfers)
                        </p>

                        <div className="space-y-4">
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
                                    placeholder="Search origin station..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {showFromDropdown && filteredFromStops.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {filteredFromStops.slice(0, 10).map((stop) => (
                                            <button
                                                key={stop.LocationCode}
                                                onClick={() => {
                                                    setFromStop(stop.LocationCode);
                                                    setSearchFrom(stop.LocationName);
                                                    setShowFromDropdown(false);
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-0"
                                            >
                                                <div className="font-medium">{stop.LocationName}</div>
                                                <div className="text-xs text-gray-500">
                                                    {stop.LocationCode}
                                                </div>
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
                                    placeholder="Search destination station..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {showToDropdown && filteredToStops.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {filteredToStops.slice(0, 10).map((stop) => (
                                            <button
                                                key={stop.LocationCode}
                                                onClick={() => {
                                                    setToStop(stop.LocationCode);
                                                    setSearchTo(stop.LocationName);
                                                    setShowToDropdown(false);
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-0"
                                            >
                                                <div className="font-medium">{stop.LocationName}</div>
                                                <div className="text-xs text-gray-500">
                                                    {stop.LocationCode}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* View Mode */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Time Range
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setViewMode('now')}
                                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                                            viewMode === 'now'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        Next Departures
                                    </button>
                                    <button
                                        onClick={() => setViewMode('day')}
                                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                                            viewMode === 'day'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        Full Day Schedule
                                    </button>
                                </div>
                            </div>

                            {/* Search Button */}
                            <button
                                onClick={handleSearch}
                                disabled={loading || !fromStop || !toStop}
                                className="w-full text-white px-6 py-3 rounded-lg font-bold disabled:cursor-not-allowed transition-colors"
                                style={{
                                    backgroundColor: loading || !fromStop || !toStop ? theme.colors.textSecondary + '50' : theme.colors.secondary,
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading && fromStop && toStop) {
                                        e.currentTarget.style.backgroundColor = theme.colors.secondaryDark;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading && fromStop && toStop) {
                                        e.currentTarget.style.backgroundColor = theme.colors.secondary;
                                    }
                                }}
                            >
                                {loading ? 'Searching...' : 'Find Trips'}
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    {error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg shadow-md p-6">
                            <div className="flex items-start">
                                <svg
                                    className="w-6 h-6 text-red-600 mr-3 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <div>
                                    <h3 className="text-lg font-bold text-red-800 mb-1">Error Fetching Journeys</h3>
                                    <p className="text-red-700">{error}</p>
                                    <p className="text-sm text-red-600 mt-2">
                                        Please check the console for more details and try again.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p>Searching for trips...</p>
                            </div>
                        </div>
                    ) : journeys.length > 0 ? (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold">
                                {journeys.length} Direct Trip{journeys.length !== 1 ? 's' : ''} Found
                            </h3>
                            {journeys.map((journey, index) => {
                                const service = journey.Services[0];
                                const trip = service.Trips.trip[0];

                                return (
                                    <div
                                        key={index}
                                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div
                                                        className="w-1 h-16 rounded-full"
                                                        style={{ backgroundColor: `#${service.Colour}` }}
                                                    />
                                                    <div>
                                                        <div className="text-xl font-bold">{trip.Display}</div>
                                                        <div className="text-sm text-gray-600">
                                                            {trip.Type === 'T' ? 'Train' : 'Bus'} • Line{' '}
                                                            {trip.Line}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            Trip #{trip.Number}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6 text-sm">
                                                    <div>
                                                        <div className="text-gray-500 text-xs">Departure</div>
                                                        <div className="font-bold text-lg text-blue-600">
                                                            {formatTime(service.StartTime)}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 flex items-center">
                                                        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
                                                        <div className="px-2 text-gray-500">
                                                            {parseDuration(service.Duration)}
                                                        </div>
                                                        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
                                                    </div>
                                                    <div>
                                                        <div className="text-gray-500 text-xs">Arrival</div>
                                                        <div className="font-bold text-lg text-green-600">
                                                            {formatTime(service.EndTime)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {service.Accessible && (
                                                    <div className="mt-3 flex items-center gap-2 text-xs">
                                                        <svg
                                                            className="w-4 h-4 text-blue-600"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" />
                                                        </svg>
                                                        <span className="text-gray-600">
                                                            Accessible:{' '}
                                                            {service.Accessible === 'R'
                                                                ? 'Reserved'
                                                                : service.Accessible === 'B'
                                                                ? 'Both'
                                                                : 'Reserved & Both'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="ml-4">
                                                <div className="bg-blue-50 px-4 py-2 rounded-lg text-center">
                                                    <div className="text-xs text-gray-600">Direction</div>
                                                    <div className="text-2xl font-bold text-blue-600">
                                                        {service.Direction}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : fromStop && toStop && !loading ? (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <svg
                                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01"
                                />
                            </svg>
                            <h3 className="text-lg font-bold text-gray-700 mb-2">No Direct Trips Found</h3>
                            <p className="text-gray-600">
                                There are no direct trips (same line, no transfers) between these stations.
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Try selecting different stations or check if they're on the same GO Transit
                                line.
                            </p>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
