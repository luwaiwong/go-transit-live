import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LiveMap } from '../src/components/LiveMap';
import { BottomPanel } from '../src/components/BottomPanel';
import { useTheme } from '../src/contexts/ThemeContext';
import { MapMarker } from '../src/types';

export default function HomeScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  const handleMarkerPress = (marker: MapMarker) => {
    setSelectedMarker(marker);
  };

  const handleClosePanel = () => {
    setSelectedMarker(null);
  };

  const toggleTheme = () => {
    const modes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
    const currentIndex = modes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setThemeMode(modes[nextIndex]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.mapContainer}>
        <LiveMap onMarkerPress={handleMarkerPress} />

        {/* Theme toggle button */}
        <TouchableOpacity
          style={[
            styles.themeButton,
            { backgroundColor: theme.colors.card }
          ]}
          onPress={toggleTheme}
        >
          <Text style={[styles.themeButtonText, { color: theme.colors.text }]}>
            {themeMode === 'auto' ? '🌓' : themeMode === 'dark' ? '🌙' : '☀️'}
          </Text>
        </TouchableOpacity>

        {/* App title overlay */}
        <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            GO Transit Live
          </Text>
        </View>
      </View>

      <BottomPanel
        selectedMarker={selectedMarker}
        onClose={handleClosePanel}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  themeButton: {
    position: 'absolute',
    top: 70,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  themeButtonText: {
    fontSize: 24,
  },
});
