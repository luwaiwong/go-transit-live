'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeCustomizer from '../../components/ThemeCustomizer';

export default function SettingsPage() {
    const { theme, setTheme, presets, customThemes, deleteCustomTheme } = useTheme();
    const [openaiApiKey, setOpenaiApiKey] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [useClientSideApi, setUseClientSideApi] = useState(false);
    const [debugApiLogging, setDebugApiLogging] = useState(false);

    useEffect(() => {
        // Load saved settings from localStorage
        const savedApiKey = localStorage.getItem('openai_api_key');
        const savedUseClientSide = localStorage.getItem('use_client_side_api');
        const savedDebugLogging = localStorage.getItem('debug_api_logging');

        if (savedApiKey) {
            setOpenaiApiKey(savedApiKey);
        }
        if (savedUseClientSide === 'true') {
            setUseClientSideApi(true);
        }
        if (savedDebugLogging === 'true') {
            setDebugApiLogging(true);
        }
    }, []);

    const handleSave = () => {
        // Save settings to localStorage
        if (openaiApiKey) {
            localStorage.setItem('openai_api_key', openaiApiKey);
        } else {
            localStorage.removeItem('openai_api_key');
        }
        localStorage.setItem('use_client_side_api', useClientSideApi.toString());
        localStorage.setItem('debug_api_logging', debugApiLogging.toString());

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const handleClear = () => {
        setOpenaiApiKey('');
        setUseClientSideApi(false);
        setDebugApiLogging(false);
        localStorage.removeItem('openai_api_key');
        localStorage.removeItem('use_client_side_api');
        localStorage.removeItem('debug_api_logging');
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const maskApiKey = (key: string) => {
        if (!key || key.length < 8) return key;
        return key.slice(0, 7) + '•'.repeat(key.length - 11) + key.slice(-4);
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.colors.background }}>
            {/* Header */}
            <header className="text-white p-4 shadow-md" style={{ backgroundColor: theme.colors.primary }}>
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold">GO Transit - Settings</h1>
                    <nav className="flex gap-4">
                        <Link href="/" className="hover:underline">
                            Map
                        </Link>
                        <Link href="/schedule" className="hover:underline">
                            Schedule
                        </Link>
                        <Link href="/navigate" className="hover:underline">
                            Navigate
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-6 max-w-3xl">
                    <div className="rounded-lg shadow-md p-6 mb-6" style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}>
                        <h2 className="text-2xl font-bold mb-6">Application Settings</h2>

                        {/* Theme Section */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold">Theme</h3>
                            </div>
                            <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>
                                Choose a preset theme or customize your own colors
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                                        Preset Themes
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {presets.map((preset) => (
                                            <button
                                                key={preset.id}
                                                onClick={() => setTheme(preset)}
                                                className={`p-4 rounded-lg border-2 transition-all ${
                                                    theme.id === preset.id ? 'ring-2 ring-offset-2' : ''
                                                }`}
                                                style={{
                                                    backgroundColor: preset.colors.surface,
                                                    borderColor: theme.id === preset.id ? preset.colors.primary : preset.colors.textSecondary,
                                                    color: preset.colors.text,
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex gap-1">
                                                        <div
                                                            className="w-6 h-6 rounded"
                                                            style={{ backgroundColor: preset.colors.primary }}
                                                        />
                                                        <div
                                                            className="w-6 h-6 rounded"
                                                            style={{ backgroundColor: preset.colors.secondary }}
                                                        />
                                                        <div
                                                            className="w-6 h-6 rounded"
                                                            style={{ backgroundColor: preset.colors.accent }}
                                                        />
                                                    </div>
                                                    <span className="font-medium text-sm">{preset.name}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Current Theme Preview */}
                                <div className="p-4 rounded-lg border" style={{ borderColor: theme.colors.textSecondary }}>
                                    <h4 className="text-sm font-medium mb-3" style={{ color: theme.colors.text }}>
                                        Current Theme: {theme.name}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span style={{ color: theme.colors.textSecondary }}>Primary: </span>
                                            <span className="font-mono">{theme.colors.primary}</span>
                                        </div>
                                        <div>
                                            <span style={{ color: theme.colors.textSecondary }}>Secondary: </span>
                                            <span className="font-mono">{theme.colors.secondary}</span>
                                        </div>
                                        <div>
                                            <span style={{ color: theme.colors.textSecondary }}>Accent: </span>
                                            <span className="font-mono">{theme.colors.accent}</span>
                                        </div>
                                        <div>
                                            <span style={{ color: theme.colors.textSecondary }}>Background: </span>
                                            <span className="font-mono">{theme.colors.background}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Custom Theme Creator */}
                                <div className="mt-4">
                                    <ThemeCustomizer />
                                </div>

                                {/* Custom Themes List */}
                                {customThemes.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium mb-3" style={{ color: theme.colors.text }}>
                                            Your Custom Themes ({customThemes.length})
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {customThemes.map((customTheme) => (
                                                <div
                                                    key={customTheme.id}
                                                    className="p-4 rounded-lg border-2 transition-all"
                                                    style={{
                                                        backgroundColor: customTheme.colors.surface,
                                                        borderColor: theme.id === customTheme.id ? customTheme.colors.primary : customTheme.colors.textSecondary,
                                                        color: customTheme.colors.text,
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex gap-1">
                                                                <div
                                                                    className="w-6 h-6 rounded"
                                                                    style={{ backgroundColor: customTheme.colors.primary }}
                                                                />
                                                                <div
                                                                    className="w-6 h-6 rounded"
                                                                    style={{ backgroundColor: customTheme.colors.secondary }}
                                                                />
                                                                <div
                                                                    className="w-6 h-6 rounded"
                                                                    style={{ backgroundColor: customTheme.colors.accent }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => deleteCustomTheme(customTheme.id)}
                                                            className="p-1 rounded transition-colors hover:bg-red-100"
                                                            title="Delete theme"
                                                        >
                                                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => setTheme(customTheme)}
                                                        className="w-full text-left"
                                                    >
                                                        <span className="font-medium text-sm">{customTheme.name}</span>
                                                        {theme.id === customTheme.id && (
                                                            <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ backgroundColor: customTheme.colors.primary + '30', color: customTheme.colors.primary }}>
                                                                Active
                                                            </span>
                                                        )}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t mb-8" style={{ borderColor: theme.colors.textSecondary }}></div>

                        {/* OpenAI API Key Section */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold">OpenAI API Key</h3>
                                <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: theme.colors.primaryLight + '30', color: theme.colors.primary }}>
                                    Optional
                                </span>
                            </div>
                            <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>
                                Provide your own OpenAI API key for client-side API calls. This bypasses
                                the backend and allows you to use your own OpenAI quota.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                                        API Key
                                    </label>
                                    <input
                                        type="password"
                                        value={openaiApiKey}
                                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                                        placeholder="sk-..."
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                                        style={{
                                            borderColor: theme.colors.textSecondary,
                                            backgroundColor: theme.colors.surface,
                                            color: theme.colors.text
                                        }}
                                    />
                                    {openaiApiKey && (
                                        <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                                            Key preview: {maskApiKey(openaiApiKey)}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="useClientSideApi"
                                        checked={useClientSideApi}
                                        onChange={(e) => setUseClientSideApi(e.target.checked)}
                                        className="h-4 w-4 rounded"
                                    />
                                    <label
                                        htmlFor="useClientSideApi"
                                        className="ml-2 block text-sm"
                                        style={{ color: theme.colors.text }}
                                    >
                                        Enable client-side API calls using my API key
                                    </label>
                                </div>
                            </div>

                            {/* Warning Box */}
                            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                <div className="flex">
                                    <svg
                                        className="h-5 w-5 text-yellow-400 mr-2"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <div>
                                        <h4 className="text-sm font-medium text-yellow-800">
                                            Security Notice
                                        </h4>
                                        <p className="text-xs text-yellow-700 mt-1">
                                            Your API key is stored locally in your browser and is never sent
                                            to our servers. Keep your API key secure and never share it with
                                            others.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Debug Logging Section */}
                        <div className="mb-8 pt-8 border-t border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold">Developer Options</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Advanced options for debugging and development.
                            </p>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="debugApiLogging"
                                    checked={debugApiLogging}
                                    onChange={(e) => setDebugApiLogging(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="debugApiLogging"
                                    className="ml-2 block text-sm text-gray-700"
                                >
                                    Enable full API response logging in browser console
                                </label>
                            </div>

                            <div className="mt-2 bg-gray-50 border-l-4 border-gray-400 p-3">
                                <p className="text-xs text-gray-600">
                                    When enabled, complete API responses from Metrolinx will be logged to the browser console.
                                    This is useful for debugging but may clutter your console.
                                </p>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-3">How It Works</h3>
                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        1
                                    </div>
                                    <p>
                                        Enter your OpenAI API key obtained from{' '}
                                        <a
                                            href="https://platform.openai.com/api-keys"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            OpenAI Platform
                                        </a>
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        2
                                    </div>
                                    <p>
                                        Enable client-side API calls to use your own OpenAI quota instead of
                                        the backend server
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        3
                                    </div>
                                    <p>
                                        Your settings are saved in your browser's local storage and persist
                                        across sessions
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleSave}
                                className="flex-1 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                style={{
                                    backgroundColor: theme.colors.primary,
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.primaryDark}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.primary}
                            >
                                Save Settings
                            </button>
                            <button
                                onClick={handleClear}
                                className="px-6 py-3 rounded-lg font-medium transition-colors"
                                style={{
                                    backgroundColor: theme.colors.textSecondary + '30',
                                    color: theme.colors.text
                                }}
                            >
                                Clear All
                            </button>
                        </div>

                        {/* Success Message */}
                        {isSaved && (
                            <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4">
                                <div className="flex">
                                    <svg
                                        className="h-5 w-5 text-green-400 mr-2"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <p className="text-sm font-medium text-green-800">
                                        Settings saved successfully!
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Additional Info Card */}
                    <div className="bg-blue-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">About GO Transit Live</h3>
                        <p className="text-sm text-blue-800 mb-3">
                            This application provides real-time tracking of GO Transit trains and schedules
                            using the Metrolinx Open API.
                        </p>
                        <div className="space-y-2 text-sm text-blue-700">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span>View live train positions on the map</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span>Check station schedules and departure times</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span>Plan direct trips between stations (same line only)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
