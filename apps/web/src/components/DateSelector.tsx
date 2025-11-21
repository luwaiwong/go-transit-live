'use client';

import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface DateSelectorProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    showTimePicker?: boolean;
}

export default function DateSelector({ selectedDate, onDateChange, showTimePicker = false }: DateSelectorProps) {
    const { theme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTime, setSelectedTime] = useState({
        hour: selectedDate.getHours(),
        minute: selectedDate.getMinutes(),
    });

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
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
            });
        }
    };

    const getNextDays = (count: number) => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < count; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push(date);
        }
        return days;
    };

    const nextDays = getNextDays(7); // Show next 7 days

    const handleTimeChange = (hour: number, minute: number) => {
        const newDate = new Date(selectedDate);
        newDate.setHours(hour, minute, 0, 0);
        setSelectedTime({ hour, minute });
        onDateChange(newDate);
    };

    const formatTime = (hour: number, minute: number) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const displayMinute = minute.toString().padStart(2, '0');
        return `${displayHour}:${displayMinute} ${period}`;
    };

    // Generate time options (every 15 minutes)
    const timeOptions = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 15) {
            timeOptions.push({ hour: h, minute: m });
        }
    }

    return (
        <div className="space-y-3">
            <div className="relative">
                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
                    Date
                </label>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 flex items-center justify-between"
                style={{
                    borderColor: theme.colors.textSecondary,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                }}
            >
                <span>{formatDate(selectedDate)}</span>
                <svg
                    className="w-4 h-4 transition-transform"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    {/* Dropdown */}
                    <div
                        className="absolute z-20 w-full mt-1 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                        style={{
                            backgroundColor: theme.colors.surface,
                            border: `1px solid ${theme.colors.textSecondary}`,
                        }}
                    >
                        {nextDays.map((date, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    onDateChange(date);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 border-b last:border-0 transition-colors"
                                style={{
                                    borderColor: theme.colors.textSecondary + '30',
                                    backgroundColor:
                                        selectedDate.toDateString() === date.toDateString()
                                            ? theme.colors.primaryLight + '30'
                                            : 'transparent',
                                    color: theme.colors.text,
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedDate.toDateString() !== date.toDateString()) {
                                        e.currentTarget.style.backgroundColor = theme.colors.primaryLight + '20';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedDate.toDateString() !== date.toDateString()) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                <div className="font-medium">{formatDate(date)}</div>
                                <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                    {date.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}
            </div>

            {/* Time Picker */}
            {showTimePicker && (
                <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
                        Time
                    </label>
                    <div className="relative">
                        <select
                            value={`${selectedTime.hour}:${selectedTime.minute}`}
                            onChange={(e) => {
                                const [hour, minute] = e.target.value.split(':').map(Number);
                                handleTimeChange(hour, minute);
                            }}
                            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                            style={{
                                borderColor: theme.colors.textSecondary,
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.text,
                            }}
                        >
                            {timeOptions.map(({ hour, minute }) => (
                                <option key={`${hour}:${minute}`} value={`${hour}:${minute}`}>
                                    {formatTime(hour, minute)}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ color: theme.colors.textSecondary }}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
