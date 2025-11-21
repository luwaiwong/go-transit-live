'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';

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

interface StopDetails {
    LocationCode: string;
    LocationName: string;
    LocationType: string;
    PublicStopID: string;
    Latitude: string;
    Longitude: string;
    IsBus: boolean;
    IsTrain: boolean;
}

export default function Index() {
    const [selectedStop, setSelectedStop] = useState<StopDetails | null>(null);

    const handleStopClick = (stop: StopDetails) => {
        setSelectedStop(stop);
    };

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <header className="bg-blue-600 text-white p-4 shadow-md z-10">
                <div className="container mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">GO Transit Live</h1>
                        <p className="text-xs text-blue-100">Real-time train tracking</p>
                    </div>
                    <nav className="flex gap-4">
                        <Link
                            href="/schedule"
                            className="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
                        >
                            Schedule
                        </Link>
                        <Link
                            href="/navigate"
                            className="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
                        >
                            Navigate
                        </Link>
                        <Link
                            href="/settings"
                            className="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
                        >
                            Settings
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Map */}
                <div className="flex-1 relative">
                    <TransitMap onStopClick={handleStopClick} />
                </div>

                {/* Info Panel */}
                {selectedStop && (
                    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-10">
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-bold">{selectedStop.LocationName}</h3>
                            <button
                                onClick={() => setSelectedStop(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-gray-600">Station Code:</span>{' '}
                                <span className="font-medium">{selectedStop.LocationCode}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Type:</span>{' '}
                                {selectedStop.IsTrain && (
                                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                                        Train
                                    </span>
                                )}
                                {selectedStop.IsBus && (
                                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                        Bus
                                    </span>
                                )}
                            </div>
                            <div className="pt-3 space-y-2">
                                <Link
                                    href={`/schedule?stop=${selectedStop.LocationCode}`}
                                    className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    View Schedule
                                </Link>
                                <Link
                                    href={`/navigate?from=${selectedStop.LocationCode}`}
                                    className="block w-full text-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Plan Trip From Here
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
                    <h4 className="font-bold text-sm mb-3">Legend</h4>
                    <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-white"></div>
                            </div>
                            <span>Live Train</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                            <span>Station</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-white"></div>
                            </div>
                            <span>Selected Station</span>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                        <p>Vehicle positions update every 30 seconds</p>
                    </div>
                </div>

                {/* Welcome Message */}
                <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-lg shadow-lg p-4 max-w-md z-10">
                    <div className="flex items-start gap-3">
                        <svg
                            className="w-6 h-6 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <div>
                            <h3 className="font-bold text-sm mb-1">Welcome to GO Transit Live!</h3>
                            <p className="text-xs text-blue-100">
                                Click on any station or train marker to view details. Use the navigation menu
                                to check schedules and plan your trip.
                            </p>
                        </div>
                        <button
                            onClick={(e) => {
                                const parent = e.currentTarget.closest('.absolute');
                                if (parent) parent.remove();
                            }}
                            className="text-blue-100 hover:text-white flex-shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
