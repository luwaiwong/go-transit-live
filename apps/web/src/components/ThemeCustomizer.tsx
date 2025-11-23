'use client';

import { useState } from 'react';
import { useTheme, ThemeColors, Theme } from '../contexts/ThemeContext';

interface ThemeCustomizerProps {
    onClose?: () => void;
}

export default function ThemeCustomizer({ onClose }: ThemeCustomizerProps) {
    const { theme, setTheme, createCustomTheme, saveCustomTheme } = useTheme();
    const [customName, setCustomName] = useState('My Custom Theme');
    const [customColors, setCustomColors] = useState<ThemeColors>(theme.colors);
    const [showCustomizer, setShowCustomizer] = useState(false);

    const handleColorChange = (key: keyof ThemeColors, value: string) => {
        setCustomColors({
            ...customColors,
            [key]: value,
        });
    };

    const handleApplyCustomTheme = () => {
        const newTheme = createCustomTheme(customName, customColors);
        saveCustomTheme(newTheme);
        if (onClose) onClose();
    };

    const handleResetToCurrentTheme = () => {
        setCustomColors(theme.colors);
        setCustomName(theme.name);
    };

    const handleLoadPreview = () => {
        const previewTheme = createCustomTheme('Preview', customColors);
        setTheme(previewTheme);
    };

    const colorInputs: Array<{ key: keyof ThemeColors; label: string; description: string }> = [
        { key: 'primary', label: 'Primary', description: 'Main brand color, headers, buttons' },
        { key: 'primaryDark', label: 'Primary Dark', description: 'Hover states for primary elements' },
        { key: 'primaryLight', label: 'Primary Light', description: 'Subtle primary accents' },
        { key: 'secondary', label: 'Secondary', description: 'Secondary actions, highlights' },
        { key: 'secondaryDark', label: 'Secondary Dark', description: 'Hover states for secondary elements' },
        { key: 'secondaryLight', label: 'Secondary Light', description: 'Subtle secondary accents' },
        { key: 'accent', label: 'Accent', description: 'Emphasis, special highlights' },
        { key: 'background', label: 'Background', description: 'Main page background' },
        { key: 'surface', label: 'Surface', description: 'Cards, panels, elevated elements' },
        { key: 'text', label: 'Text', description: 'Primary text color' },
        { key: 'textSecondary', label: 'Text Secondary', description: 'Subtle text, labels' },
    ];

    return (
        <div>
            <button
                onClick={() => setShowCustomizer(!showCustomizer)}
                className="w-full p-4 rounded-lg border-2 transition-all text-left"
                style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.primary,
                    color: theme.colors.text,
                }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        <span className="font-semibold">Create Custom Theme</span>
                    </div>
                    <svg
                        className={`w-5 h-5 transition-transform ${showCustomizer ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {showCustomizer && (
                <div className="mt-4 p-6 rounded-lg border" style={{ borderColor: theme.colors.textSecondary, backgroundColor: theme.colors.surface }}>
                    {/* Theme Name Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                            Theme Name
                        </label>
                        <input
                            type="text"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder="Enter theme name..."
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                            style={{
                                borderColor: theme.colors.textSecondary,
                                backgroundColor: theme.colors.background,
                                color: theme.colors.text,
                            }}
                        />
                    </div>

                    {/* Color Inputs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {colorInputs.map(({ key, label, description }) => (
                            <div key={key} className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-8 h-8 rounded border-2"
                                        style={{
                                            backgroundColor: customColors[key],
                                            borderColor: theme.colors.textSecondary,
                                        }}
                                    />
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium" style={{ color: theme.colors.text }}>
                                            {label}
                                        </label>
                                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                            {description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={customColors[key]}
                                        onChange={(e) => handleColorChange(key, e.target.value)}
                                        className="w-16 h-10 rounded cursor-pointer border"
                                        style={{ borderColor: theme.colors.textSecondary }}
                                    />
                                    <input
                                        type="text"
                                        value={customColors[key]}
                                        onChange={(e) => handleColorChange(key, e.target.value)}
                                        placeholder="#000000"
                                        className="flex-1 px-3 py-2 border rounded text-sm font-mono focus:outline-none focus:ring-2"
                                        style={{
                                            borderColor: theme.colors.textSecondary,
                                            backgroundColor: theme.colors.background,
                                            color: theme.colors.text,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Preview Section */}
                    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: customColors.background }}>
                        <h4 className="text-sm font-semibold mb-3" style={{ color: customColors.text }}>
                            Live Preview
                        </h4>
                        <div className="space-y-3">
                            {/* Sample Header */}
                            <div className="p-3 rounded" style={{ backgroundColor: customColors.primary }}>
                                <p className="text-white font-medium">Primary Header</p>
                            </div>
                            {/* Sample Card */}
                            <div className="p-4 rounded border" style={{ backgroundColor: customColors.surface, borderColor: customColors.textSecondary }}>
                                <h5 className="font-semibold mb-2" style={{ color: customColors.text }}>
                                    Card Title
                                </h5>
                                <p className="text-sm mb-3" style={{ color: customColors.textSecondary }}>
                                    This is how your text will appear with the custom theme colors.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        className="px-4 py-2 rounded text-white text-sm font-medium"
                                        style={{ backgroundColor: customColors.secondary }}
                                    >
                                        Secondary Button
                                    </button>
                                    <button
                                        className="px-4 py-2 rounded text-sm font-medium"
                                        style={{
                                            backgroundColor: customColors.accent,
                                            color: customColors.text,
                                        }}
                                    >
                                        Accent Button
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={handleApplyCustomTheme}
                            className="flex-1 min-w-[200px] text-white px-6 py-3 rounded-lg font-medium transition-colors"
                            style={{
                                backgroundColor: theme.colors.primary,
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.primaryDark}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.primary}
                        >
                            Apply Custom Theme
                        </button>
                        <button
                            onClick={handleLoadPreview}
                            className="flex-1 min-w-[180px] px-6 py-3 rounded-lg font-medium transition-colors"
                            style={{
                                backgroundColor: theme.colors.secondary,
                                color: '#ffffff',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.secondaryDark}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.secondary}
                        >
                            Preview Theme
                        </button>
                        <button
                            onClick={handleResetToCurrentTheme}
                            className="px-6 py-3 rounded-lg font-medium transition-colors"
                            style={{
                                backgroundColor: theme.colors.textSecondary + '30',
                                color: theme.colors.text,
                            }}
                        >
                            Reset to Current
                        </button>
                    </div>

                    {/* Info Box */}
                    <div className="mt-4 p-3 rounded border-l-4" style={{ backgroundColor: customColors.primaryLight + '20', borderColor: customColors.primary }}>
                        <p className="text-xs" style={{ color: theme.colors.text }}>
                            <strong>Tip:</strong> Use "Preview Theme" to see changes without saving. Click "Apply Custom Theme" to save and use your custom theme across the app.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
