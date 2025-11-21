import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useTheme } from '../contexts/ThemeContext';
import { MapMarker } from '../types';
import { fetchStationDetails, getStationMarkers, fetchVehiclePositions, getVehicleMarkers } from '../services/api';

const DEFAULT_CENTER = {
  latitude: 43.65107,
  longitude: -79.347015,
};

const DEFAULT_DELTA = {
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

interface LiveMapProps {
  onMarkerPress?: (marker: MapMarker) => void;
}

export const LiveMap = ({ onMarkerPress }: LiveMapProps) => {
  const { theme } = useTheme();
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    loadInitialData();

    // Set up interval to update vehicle positions every second
    const interval = setInterval(() => {
      updateVehiclePositions();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const stationData = await fetchStationDetails();
      const stationMarkers = getStationMarkers(stationData, true);
      setMarkers(stationMarkers);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateVehiclePositions = async () => {
    try {
      const vehicles = await fetchVehiclePositions();
      const vehicleMarkers = getVehicleMarkers(vehicles);

      // Combine station markers with vehicle markers
      setMarkers(prev => {
        const stationMarkers = prev.filter(m => m.type === 'station');
        return [...stationMarkers, ...vehicleMarkers];
      });
    } catch (error) {
      console.error('Error updating vehicle positions:', error);
    }
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'train':
        return theme.colors.train;
      case 'bus':
        return theme.colors.bus;
      case 'station':
        return theme.colors.station;
      default:
        return theme.colors.primary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          ...DEFAULT_CENTER,
          ...DEFAULT_DELTA,
        }}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        showsScale
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.position}
            title={marker.name}
            description={marker.type}
            pinColor={getMarkerColor(marker.type)}
            onPress={() => onMarkerPress?.(marker)}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
