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
                <svg width="20" height="20" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="8" fill="#0066CC" stroke="white" strokeWidth="2"/>
                    <text x="12" y="15.5" fontFamily="Arial" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle">T</text>
                </svg>
            ),
            label: 'Train Station'
        },
        {
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24">
                    <rect x="4" y="4" width="16" height="16" rx="2" fill="#FF6B00" stroke="white" strokeWidth="2"/>
                    <text x="12" y="15.5" fontFamily="Arial" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle">B</text>
                </svg>
            ),
            label: 'Bus Stop'
        },
        {
            icon: (
                <svg width="24" height="24" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="12" fill="#00A850" stroke="white" strokeWidth="3"/>
                    <text x="16" y="21" fontFamily="Arial" fontSize="14" fontWeight="bold" fill="white" textAnchor="middle">T</text>
                </svg>
            ),
            label: 'Live Train'
        },
        {
            icon: (
                <svg width="24" height="24" viewBox="0 0 32 32">
                    <rect x="4" y="8" width="24" height="16" rx="3" fill="#FF6B00" stroke="white" strokeWidth="3"/>
                    <text x="16" y="21" fontFamily="Arial" fontSize="14" fontWeight="bold" fill="white" textAnchor="middle">B</text>
                </svg>
            ),
            label: 'Live Bus'
        }
    ];

    return (
        <div
            className={`rounded-lg shadow-xl p-3 backdrop-blur-sm ${className}`}
            style={{
                backgroundColor: theme.colors.surface + 'F0',
                border: `1px solid ${theme.colors.textSecondary}60`
            }}
        >
            <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: theme.colors.text }}>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" style={{ color: theme.colors.primary }}>
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Legend
            </h3>
            <div className="space-y-1">
                {legendItems.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 py-1 px-1.5 rounded transition-colors"
                        style={{
                            backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.primaryLight + '15'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <div className="flex-shrink-0 flex items-center justify-center" style={{ width: '24px', height: '24px' }}>
                            {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium" style={{ color: theme.colors.text }}>
                                {item.label}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
