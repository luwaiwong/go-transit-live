'use client';

import { useTheme } from '../contexts/ThemeContext';

interface MapLegendProps {
    className?: string;
}

export default function MapLegend({ className = '' }: MapLegendProps) {
    const { theme } = useTheme();

    const legendItems = [
        {
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="8" fill="#0066CC" stroke="white" strokeWidth="2"/>
                    <text x="12" y="15.5" fontFamily="Arial" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle">T</text>
                </svg>
            ),
            label: 'Train Station',
            description: 'GO Train station'
        },
        {
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <rect x="4" y="4" width="16" height="16" rx="2" fill="#FF6B00" stroke="white" strokeWidth="2"/>
                    <text x="12" y="15.5" fontFamily="Arial" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle">B</text>
                </svg>
            ),
            label: 'Bus Stop',
            description: 'GO Bus stop'
        },
        {
            icon: (
                <svg width="32" height="32" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="12" fill="#00A850" stroke="white" strokeWidth="3"/>
                    <text x="16" y="21" fontFamily="Arial" fontSize="14" fontWeight="bold" fill="white" textAnchor="middle">T</text>
                </svg>
            ),
            label: 'Live Train',
            description: 'Train in motion'
        },
        {
            icon: (
                <svg width="32" height="32" viewBox="0 0 32 32">
                    <rect x="4" y="8" width="24" height="16" rx="3" fill="#FF6B00" stroke="white" strokeWidth="3"/>
                    <text x="16" y="21" fontFamily="Arial" fontSize="14" fontWeight="bold" fill="white" textAnchor="middle">B</text>
                </svg>
            ),
            label: 'Live Bus',
            description: 'Bus in motion'
        }
    ];

    return (
        <div
            className={`rounded-lg shadow-lg p-4 ${className}`}
            style={{
                backgroundColor: theme.colors.surface,
                border: `2px solid ${theme.colors.textSecondary}40`
            }}
        >
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: theme.colors.text }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: theme.colors.primary }}>
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Map Legend
            </h3>
            <div className="space-y-2">
                {legendItems.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 py-1.5 px-2 rounded transition-colors"
                        style={{
                            backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.primaryLight + '10'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <div className="flex-shrink-0 flex items-center justify-center" style={{ width: '32px', height: '32px' }}>
                            {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium" style={{ color: theme.colors.text }}>
                                {item.label}
                            </div>
                            <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                {item.description}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: theme.colors.textSecondary + '40', color: theme.colors.textSecondary }}>
                <p>Click on any station to select it for trip planning</p>
                <p className="mt-1">Live positions update every 30 seconds</p>
            </div>
        </div>
    );
}
