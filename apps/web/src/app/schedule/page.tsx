'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import TransitMap with no SSR
const TransitMap = dynamic(() => import('../../components/TransitMap'), {
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

interface NextService {
    StopCode: string;
    LineCode: string;
    LineName: string;
    ServiceType: 'T' | 'B';
    DirectionCode: string;
    DirectionName: string;
    TripNumber: string;
    ScheduledDepartureTime: string;
    ComputedDepartureTime: string;
    DepartureStatus: string;
    ScheduledPlatform: string;
    ActualPlatform: string;
}

export default function SchedulePage() {
    const [stops, setStops] = useState<Stop[]>([]);
    const [selectedStop, setSelectedStop] = useState<StopDetails | null>(null);
    const [services, setServices] = useState<NextService[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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

    const handleStopSelect = async (stop: Stop | StopDetails) => {
        setLoading(true);
        try {
            // Fetch stop details if not already a StopDetails object
            let stopDetails: StopDetails;
            if ('Latitude' in stop) {
                stopDetails = stop;
            } else {
                const detailsResponse = await fetch(`/api/stop-details/${stop.LocationCode}`);
                stopDetails = await detailsResponse.json();
            }
            setSelectedStop(stopDetails);

            // Fetch next services
            const servicesResponse = await fetch(`/api/next-service/${stop.LocationCode}`);
            const servicesData = await servicesResponse.json();
            setServices(servicesData.Lines || []);
        } catch (error) {
            console.error('Error fetching stop data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStops = stops.filter(
        (stop) =>
            stop.LocationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stop.LocationCode.toLowerCase().includes(searchQuery.toLowerCase())
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

    const getTimeDifference = (timeStr: string) => {
        try {
            const date = new Date(timeStr.replace(' ', 'T'));
            const now = new Date();
            const diffMs = date.getTime() - now.getTime();
            const diffMins = Math.round(diffMs / 60000);

            if (diffMins < 0) return 'Departed';
            if (diffMins === 0) return 'Now';
            if (diffMins === 1) return '1 min';
            return `${diffMins} mins`;
        } catch {
            return '';
        }
    };

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <header className="bg-blue-600 text-white p-4 shadow-md">
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold">GO Transit - Station Schedule</h1>
                    <nav className="flex gap-4">
                        <Link href="/" className="hover:underline">
                            Map
                        </Link>
                        <Link href="/navigate" className="hover:underline">
                            Navigate
                        </Link>
                        <Link href="/settings" className="hover:underline">
                            Settings
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
                    {/* Search */}
                    <div className="p-4 border-b border-gray-200">
                        <input
                            type="text"
                            placeholder="Search stations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Station List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredStops.map((stop) => (
                            <button
                                key={stop.LocationCode}
                                onClick={() => handleStopSelect(stop)}
                                className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                                    selectedStop?.LocationCode === stop.LocationCode ? 'bg-blue-100' : ''
                                }`}
                            >
                                <div className="font-medium">{stop.LocationName}</div>
                                <div className="text-xs text-gray-500">{stop.LocationCode}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Schedule Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {selectedStop ? (
                        <>
                            {/* Station Info */}
                            <div className="bg-gray-50 p-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold">{selectedStop.LocationName}</h2>
                                <p className="text-sm text-gray-600">
                                    Station Code: {selectedStop.LocationCode}
                                </p>
                            </div>

                            {/* Departures */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                            <p>Loading departures...</p>
                                        </div>
                                    </div>
                                ) : services.length === 0 ? (
                                    <div className="text-center text-gray-500 mt-8">
                                        No upcoming departures found for this station.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {services.map((service, index) => {
                                            const departureTime =
                                                service.ComputedDepartureTime || service.ScheduledDepartureTime;
                                            const isDelayed =
                                                service.ComputedDepartureTime &&
                                                service.ComputedDepartureTime !== service.ScheduledDepartureTime;
                                            const platformChanged =
                                                service.ActualPlatform &&
                                                service.ActualPlatform !== service.ScheduledPlatform;

                                            return (
                                                <div
                                                    key={`${service.TripNumber}-${index}`}
                                                    className="bg-white rounded-lg shadow p-4 border border-gray-200"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-bold text-lg">
                                                                    {service.LineName}
                                                                </span>
                                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                                    {service.ServiceType === 'T' ? 'Train' : 'Bus'}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-gray-600 mb-2">
                                                                To: {service.DirectionName.split(' - ')[1]}
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm">
                                                                <div>
                                                                    <span className="text-gray-500">Platform: </span>
                                                                    <span
                                                                        className={
                                                                            platformChanged
                                                                                ? 'font-bold text-orange-600'
                                                                                : 'font-medium'
                                                                        }
                                                                    >
                                                                        {service.ActualPlatform || service.ScheduledPlatform}
                                                                    </span>
                                                                    {platformChanged && (
                                                                        <span className="text-xs text-orange-600 ml-1">
                                                                            (Changed)
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">Trip: </span>
                                                                    <span className="font-mono text-xs">
                                                                        {service.TripNumber}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right ml-4">
                                                            <div
                                                                className={`text-2xl font-bold ${
                                                                    isDelayed ? 'text-orange-600' : 'text-blue-600'
                                                                }`}
                                                            >
                                                                {formatTime(departureTime)}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {getTimeDifference(departureTime)}
                                                            </div>
                                                            {isDelayed && (
                                                                <div className="text-xs text-orange-600 mt-1">Delayed</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            <div className="text-center">
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
                                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                                    />
                                </svg>
                                <p className="text-lg">Select a station to view departures</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Map */}
                <div className="w-1/2 h-full">
                    <TransitMap
                        highlightedStops={selectedStop ? [selectedStop.LocationCode] : []}
                        onStopClick={handleStopSelect}
                    />
                </div>
            </div>
        </div>
    );
}
