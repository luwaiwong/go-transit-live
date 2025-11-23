'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTheme } from '../contexts/ThemeContext';
import DateSelector from '../components/DateSelector';
import MapLegend from '../components/MapLegend';

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
    const { theme } = useTheme();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [stops, setStops] = useState<Stop[]>([]);
    const [fromStop, setFromStop] = useState('');
    const [toStop, setToStop] = useState('');
    const [journeys, setJourneys] = useState<Journey[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchFrom, setSearchFrom] = useState('');
    const [searchTo, setSearchTo] = useState('');
    const [showFromDropdown, setShowFromDropdown] = useState(false);
    const [showToDropdown, setShowToDropdown] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showStationList, setShowStationList] = useState(false);
    const [stationSearchQuery, setStationSearchQuery] = useState('');

    // Get current view from URL
    const currentView = searchParams?.get('view') || 'navigation';

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
        setSearchFrom(stop.LocationName);
        setFromStop(stop.LocationCode);
    };

    // Initialize from URL params
    useEffect(() => {
        const from = searchParams?.get('from');
        const to = searchParams?.get('to');

        if (from) {
            setFromStop(from);
            const stop = stops.find(s => s.LocationCode === from);
            if (stop) setSearchFrom(stop.LocationName);
        }
        if (to) {
            setToStop(to);
            const stop = stops.find(s => s.LocationCode === to);
            if (stop) setSearchTo(stop.LocationName);
        }
    }, [searchParams, stops]);

    // Update URL
    const updateURL = (params: Record<string, string>) => {
        const current = new URLSearchParams(searchParams?.toString());
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                current.set(key, value);
            } else {
                current.delete(key);
            }
        });
        router.push(`/?${current.toString()}`);
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
            // Use selected date instead of fullDay flag
            const dateStr = selectedDate.toISOString().split('T')[0];
            const response = await fetch(
                `/api/journey?from=${fromStop}&to=${toStop}&date=${dateStr}`
            );
            const data = await response.json();
            setJourneys(Array.isArray(data) ? data : []);

            // Navigate to departures view
            updateURL({ view: 'departures', from: fromStop, to: toStop, date: dateStr });
        } catch (error) {
            console.error('Error fetching journeys:', error);
            setJourneys([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToNavigation = () => {
        updateURL({ view: 'navigation', from: '', to: '', date: '' });
        setJourneys([]);
    };

    const filteredFromStops = stops.filter((stop) =>
        stop.LocationName.toLowerCase().includes((searchFrom || '').toLowerCase())
    );

    const filteredToStops = stops.filter((stop) =>
        stop.LocationName.toLowerCase().includes((searchTo || '').toLowerCase())
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

    const formatDate = (date: Date) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
            });
        }
    };

    const filteredStations = stops?.filter((stop) =>
        stop.LocationName?.toLowerCase().includes((stationSearchQuery || '').toLowerCase())
    ) || [];

    return (
        <div className="h-screen flex" style={{ backgroundColor: theme.colors.background }}>
            {/* Left Sidebar */}
            <div className={`shadow-lg transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-96'} border-r-4`} style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }}>
                {/* Header */}
                <div className="text-white p-4 flex items-center justify-between" style={{ backgroundColor: theme.colors.primary }}>
                    {!sidebarCollapsed && (
                        <div>
                            <h1 className="text-xl font-bold">GO Transit Live</h1>
                            <p className="text-xs text-blue-100">Real-time tracking</p>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="text-white p-2 rounded transition-colors"
                        style={{ ':hover': { backgroundColor: theme.colors.primaryDark } }}
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
                        {/* View Toggle */}
                        <div className="p-4 border-b" style={{ borderColor: theme.colors.textSecondary + '40' }}>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowStationList(false)}
                                    className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                                        !showStationList ? 'text-white' : ''
                                    }`}
                                    style={{
                                        backgroundColor: !showStationList ? theme.colors.primary : theme.colors.textSecondary + '30',
                                        color: !showStationList ? '#ffffff' : theme.colors.text
                                    }}
                                >
                                    Trip Planner
                                </button>
                                <button
                                    onClick={() => setShowStationList(true)}
                                    className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                                        showStationList ? 'text-white' : ''
                                    }`}
                                    style={{
                                        backgroundColor: showStationList ? theme.colors.primary : theme.colors.textSecondary + '30',
                                        color: showStationList ? '#ffffff' : theme.colors.text
                                    }}
                                >
                                    Stations
                                </button>
                            </div>
                        </div>

                        {!showStationList ? (
                            <>
                                {currentView === 'departures' ? (
                                    /* Departures View */
                                    <div className="flex flex-col h-full">
                                        {/* Header with Back Button */}
                                        <div className="p-4 border-b" style={{ borderColor: theme.colors.textSecondary + '40' }}>
                                            <button
                                                onClick={handleBackToNavigation}
                                                className="flex items-center gap-2 mb-3 transition-colors"
                                                style={{ color: theme.colors.primary }}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                Back to Trip Planner
                                            </button>
                                            <h2 className="text-lg font-bold" style={{ color: theme.colors.text }}>
                                                {stops.find(s => s.LocationCode === fromStop)?.LocationName} → {stops.find(s => s.LocationCode === toStop)?.LocationName}
                                            </h2>
                                            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                                                {formatDate(selectedDate)}
                                            </p>
                                        </div>

                                        {/* Journey Results */}
                                        <div className="flex-1 overflow-y-auto p-4">
                                            {loading ? (
                                                <div className="flex items-center justify-center h-full">
                                                    <div className="text-center">
                                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: theme.colors.primary }}></div>
                                                        <p style={{ color: theme.colors.text }}>Loading trips...</p>
                                                    </div>
                                                </div>
                                            ) : journeys.length === 0 ? (
                                                <div className="text-center mt-8" style={{ color: theme.colors.textSecondary }}>
                                                    No direct trips found for this date.
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <h3 className="text-sm font-bold mb-3" style={{ color: theme.colors.text }}>
                                                        {journeys.length} Trip{journeys.length !== 1 ? 's' : ''} Found
                                                    </h3>
                                                    {journeys.map((journey, index) => {
                                                        const service = journey.Services[0];
                                                        const trip = service.Trips.trip[0];

                                                        return (
                                                            <div
                                                                key={index}
                                                                className="rounded-lg p-3 transition-colors"
                                                                style={{ backgroundColor: theme.colors.background }}
                                                            >
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <div
                                                                        className="w-1 h-12 rounded-full"
                                                                        style={{ backgroundColor: `#${service.Colour}` }}
                                                                    />
                                                                    <div className="flex-1">
                                                                        <div className="font-bold text-sm">{trip.Display}</div>
                                                                        <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                                                            {trip.Type === 'T' ? '🚆 Train' : '🚌 Bus'} • Line {trip.Line}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-3 text-xs">
                                                                    <div>
                                                                        <div style={{ color: theme.colors.textSecondary }}>Departs</div>
                                                                        <div className="font-bold" style={{ color: theme.colors.primary }}>
                                                                            {formatTime(service.StartTime)}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex-1 border-t border-dashed" style={{ borderColor: theme.colors.textSecondary }}></div>
                                                                    <div style={{ color: theme.colors.textSecondary }}>
                                                                        {parseDuration(service.Duration)}
                                                                    </div>
                                                                    <div className="flex-1 border-t border-dashed" style={{ borderColor: theme.colors.textSecondary }}></div>
                                                                    <div>
                                                                        <div style={{ color: theme.colors.textSecondary }}>Arrives</div>
                                                                        <div className="font-bold" style={{ color: theme.colors.secondary }}>
                                                                            {formatTime(service.EndTime)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* Navigation View */
                                    <>
                                        {/* Trip Planner */}
                                        <div className="p-4 border-b" style={{ borderColor: theme.colors.textSecondary + '40' }}>
                                            <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.colors.text }}>
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: theme.colors.primary }}>
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        Plan Your Trip
                                    </h2>

                            <div className="space-y-3">
                                {/* From Station */}
                                <div className="relative">
                                    <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
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
                                        className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                                        style={{
                                            borderColor: theme.colors.textSecondary,
                                            backgroundColor: theme.colors.surface,
                                            color: theme.colors.text
                                        }}
                                    />
                                    {showFromDropdown && filteredFromStops.length > 0 && (
                                        <div className="absolute z-20 w-full mt-1 rounded-lg shadow-lg max-h-48 overflow-y-auto" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.textSecondary}` }}>
                                            {filteredFromStops.slice(0, 8).map((stop) => (
                                                <button
                                                    key={stop.LocationCode}
                                                    onClick={() => {
                                                        setFromStop(stop.LocationCode);
                                                        setSearchFrom(stop.LocationName);
                                                        setShowFromDropdown(false);
                                                    }}
                                                    className="w-full text-left px-3 py-2 border-b last:border-0 transition-colors"
                                                    style={{
                                                        borderColor: theme.colors.textSecondary + '30',
                                                        color: theme.colors.text
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.primaryLight + '20'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <div className="font-medium text-sm">{stop.LocationName}</div>
                                                    <div className="text-xs" style={{ color: theme.colors.textSecondary }}>{stop.LocationCode}</div>
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

                                {/* Date and Time Selector */}
                                <DateSelector
                                    selectedDate={selectedDate}
                                    onDateChange={setSelectedDate}
                                    showTimePicker={true}
                                />

                                {/* Search Button */}
                                <button
                                    onClick={handleSearch}
                                    disabled={loading || !fromStop || !toStop}
                                    className="w-full text-white px-4 py-2 rounded-lg font-medium disabled:cursor-not-allowed transition-colors text-sm"
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

                        {/* Journey Results */}
                        {journeys.length > 0 && (
                            <div className="p-4 border-b" style={{ borderColor: theme.colors.textSecondary + '40' }}>
                                <h3 className="text-sm font-bold mb-3" style={{ color: theme.colors.text }}>
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
                            <div className="p-4 text-center text-sm" style={{ color: theme.colors.textSecondary }}>
                                <p>No direct trips found between these stations.</p>
                            </div>
                        )}

                        {/* Navigation Links */}
                        <div className="p-4">
                            <h3 className="text-sm font-bold mb-2" style={{ color: theme.colors.text }}>Quick Links</h3>
                            <div className="space-y-2">
                                <Link
                                    href="/schedule"
                                    className="block px-3 py-2 rounded-lg transition-colors text-sm"
                                    style={{
                                        backgroundColor: theme.colors.primaryLight + '20',
                                        color: theme.colors.primary
                                    }}
                                >
                                    View Schedules
                                </Link>
                            </div>
                        </div>
                    </>
                                )}
                            </>
                        ) : (
                            /* Station List View */
                            <div className="flex flex-col h-full">
                                <div className="p-4 border-b" style={{ borderColor: theme.colors.textSecondary + '40' }}>
                                    <input
                                        type="text"
                                        value={stationSearchQuery}
                                        onChange={(e) => setStationSearchQuery(e.target.value)}
                                        placeholder="Search stations..."
                                        className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                                        style={{
                                            borderColor: theme.colors.textSecondary,
                                            backgroundColor: theme.colors.surface,
                                            color: theme.colors.text
                                        }}
                                    />
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {filteredStations.length > 0 ? (
                                        filteredStations.map((station) => (
                                            <button
                                                key={station.LocationCode}
                                                onClick={() => {
                                                    setSearchFrom(station.LocationName);
                                                    setFromStop(station.LocationCode);
                                                    setShowStationList(false);
                                                }}
                                                className="w-full text-left px-4 py-3 border-b transition-colors"
                                                style={{
                                                    borderColor: theme.colors.textSecondary + '30',
                                                    color: theme.colors.text
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.primaryLight + '20'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <div className="font-medium">{station.LocationName}</div>
                                                <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                                    {station.LocationCode}
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-sm" style={{ color: theme.colors.textSecondary }}>
                                            No stations found
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Button */}
                <div className={`p-4 border-t ${sidebarCollapsed ? 'flex justify-center' : ''}`} style={{ borderColor: theme.colors.textSecondary + '40' }}>
                    <Link
                        href="/settings"
                        className={`flex items-center gap-2 transition-colors ${
                            sidebarCollapsed ? '' : 'w-full'
                        }`}
                        style={{ color: theme.colors.text }}
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

            {/* Main Content - Map with Legend */}
            <div className="flex-1 p-6 relative">
                <div className="h-full rounded-xl shadow-lg border-4 overflow-hidden" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.textSecondary + '50' }}>
                    <TransitMap onStopClick={handleStopClick} />
                </div>

                {/* Legend hovering over map (bottom-right) */}
                <div className="absolute bottom-10 right-10 z-10" style={{ maxWidth: '240px' }}>
                    <MapLegend />
                </div>
            </div>
        </div>
    );
}
