'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ThemeColors {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    secondaryDark: string;
    secondaryLight: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
}

export interface Theme {
    id: string;
    name: string;
    colors: ThemeColors;
}

export const presetThemes: Theme[] = [
    {
        id: 'default',
        name: 'GO Transit Classic',
        colors: {
            primary: '#2563eb',
            primaryDark: '#1d4ed8',
            primaryLight: '#3b82f6',
            secondary: '#16a34a',
            secondaryDark: '#15803d',
            secondaryLight: '#22c55e',
            accent: '#f59e0b',
            background: '#f9fafb',
            surface: '#ffffff',
            text: '#111827',
            textSecondary: '#6b7280',
        },
    },
    {
        id: 'dark-green',
        name: 'Dark Grey & Green',
        colors: {
            primary: '#374151',
            primaryDark: '#1f2937',
            primaryLight: '#4b5563',
            secondary: '#10b981',
            secondaryDark: '#059669',
            secondaryLight: '#34d399',
            accent: '#6ee7b7',
            background: '#111827',
            surface: '#1f2937',
            text: '#f9fafb',
            textSecondary: '#9ca3af',
        },
    },
    {
        id: 'midnight',
        name: 'Midnight Blue',
        colors: {
            primary: '#1e3a8a',
            primaryDark: '#1e40af',
            primaryLight: '#3b82f6',
            secondary: '#0ea5e9',
            secondaryDark: '#0284c7',
            secondaryLight: '#38bdf8',
            accent: '#f472b6',
            background: '#0f172a',
            surface: '#1e293b',
            text: '#f1f5f9',
            textSecondary: '#cbd5e1',
        },
    },
    {
        id: 'forest',
        name: 'Forest Green',
        colors: {
            primary: '#065f46',
            primaryDark: '#064e3b',
            primaryLight: '#047857',
            secondary: '#84cc16',
            secondaryDark: '#65a30d',
            secondaryLight: '#a3e635',
            accent: '#fbbf24',
            background: '#f0fdf4',
            surface: '#ffffff',
            text: '#14532d',
            textSecondary: '#4b5563',
        },
    },
    {
        id: 'sunset',
        name: 'Sunset Orange',
        colors: {
            primary: '#ea580c',
            primaryDark: '#c2410c',
            primaryLight: '#f97316',
            secondary: '#dc2626',
            secondaryDark: '#b91c1c',
            secondaryLight: '#ef4444',
            accent: '#facc15',
            background: '#fef2f2',
            surface: '#ffffff',
            text: '#7c2d12',
            textSecondary: '#78716c',
        },
    },
    {
        id: 'purple',
        name: 'Royal Purple',
        colors: {
            primary: '#7c3aed',
            primaryDark: '#6d28d9',
            primaryLight: '#8b5cf6',
            secondary: '#ec4899',
            secondaryDark: '#db2777',
            secondaryLight: '#f472b6',
            accent: '#fbbf24',
            background: '#faf5ff',
            surface: '#ffffff',
            text: '#581c87',
            textSecondary: '#6b7280',
        },
    },
];

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    presets: Theme[];
    customThemes: Theme[];
    createCustomTheme: (name: string, colors: ThemeColors) => Theme;
    saveCustomTheme: (theme: Theme) => void;
    deleteCustomTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(presetThemes[0]);
    const [customThemes, setCustomThemes] = useState<Theme[]>([]);

    useEffect(() => {
        // Load custom themes from localStorage
        const savedCustomThemes = localStorage.getItem('custom_themes');
        if (savedCustomThemes) {
            try {
                const parsedCustomThemes = JSON.parse(savedCustomThemes);
                setCustomThemes(parsedCustomThemes);
            } catch (error) {
                console.error('Error loading custom themes:', error);
            }
        }

        // Load current theme from localStorage
        const savedTheme = localStorage.getItem('app_theme');
        if (savedTheme) {
            try {
                const parsedTheme = JSON.parse(savedTheme);
                setThemeState(parsedTheme);
            } catch (error) {
                console.error('Error loading theme:', error);
            }
        }
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('app_theme', JSON.stringify(newTheme));

        // Apply CSS variables
        const root = document.documentElement;
        root.style.setProperty('--color-primary', newTheme.colors.primary);
        root.style.setProperty('--color-primary-dark', newTheme.colors.primaryDark);
        root.style.setProperty('--color-primary-light', newTheme.colors.primaryLight);
        root.style.setProperty('--color-secondary', newTheme.colors.secondary);
        root.style.setProperty('--color-secondary-dark', newTheme.colors.secondaryDark);
        root.style.setProperty('--color-secondary-light', newTheme.colors.secondaryLight);
        root.style.setProperty('--color-accent', newTheme.colors.accent);
        root.style.setProperty('--color-background', newTheme.colors.background);
        root.style.setProperty('--color-surface', newTheme.colors.surface);
        root.style.setProperty('--color-text', newTheme.colors.text);
        root.style.setProperty('--color-text-secondary', newTheme.colors.textSecondary);
    };

    const createCustomTheme = (name: string, colors: ThemeColors): Theme => {
        return {
            id: `custom-${Date.now()}`,
            name,
            colors,
        };
    };

    const saveCustomTheme = (newTheme: Theme) => {
        // Check if theme with this ID already exists
        const existingIndex = customThemes.findIndex(t => t.id === newTheme.id);

        let updatedCustomThemes: Theme[];
        if (existingIndex >= 0) {
            // Update existing theme
            updatedCustomThemes = [...customThemes];
            updatedCustomThemes[existingIndex] = newTheme;
        } else {
            // Add new theme
            updatedCustomThemes = [...customThemes, newTheme];
        }

        setCustomThemes(updatedCustomThemes);
        localStorage.setItem('custom_themes', JSON.stringify(updatedCustomThemes));

        // Also set it as the current theme
        setTheme(newTheme);
    };

    const deleteCustomTheme = (themeId: string) => {
        const updatedCustomThemes = customThemes.filter(t => t.id !== themeId);
        setCustomThemes(updatedCustomThemes);
        localStorage.setItem('custom_themes', JSON.stringify(updatedCustomThemes));

        // If the deleted theme was the current theme, switch to default
        if (theme.id === themeId) {
            setTheme(presetThemes[0]);
        }
    };

    // Apply theme on mount
    useEffect(() => {
        setTheme(theme);
    }, []);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                setTheme,
                presets: presetThemes,
                customThemes,
                createCustomTheme,
                saveCustomTheme,
                deleteCustomTheme
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
