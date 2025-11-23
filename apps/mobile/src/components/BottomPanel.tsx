import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '../contexts/ThemeContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { MapMarker } from '../types';
import { FavoriteStationCard } from './FavoriteStationCard';
import { FavoriteTripCard } from './FavoriteTripCard';

interface BottomPanelProps {
  selectedMarker: MapMarker | null;
  onClose: () => void;
}

type TabType = 'info' | 'favorites';

export const BottomPanel = ({ selectedMarker, onClose }: BottomPanelProps) => {
  const { theme } = useTheme();
  const { favoriteStations, favoriteTrips, removeFavoriteStation, removeFavoriteTrip } = useFavorites();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [activeTab, setActiveTab] = useState<TabType>('info');

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  // Render backdrop
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const renderContent = () => {
    if (selectedMarker) {
      return (
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {selectedMarker.name}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {selectedMarker.type.toUpperCase()}
          </Text>
          <View style={styles.infoContainer}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Latitude:
            </Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>
              {selectedMarker.position.latitude.toFixed(6)}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Longitude:
            </Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>
              {selectedMarker.position.longitude.toFixed(6)}
            </Text>
          </View>
        </View>
      );
    }

    if (activeTab === 'favorites') {
      return (
        <View>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Favorite Stations
          </Text>
          {favoriteStations.length > 0 ? (
            favoriteStations.map((station) => (
              <FavoriteStationCard
                key={station.id}
                station={station}
                onRemove={() => removeFavoriteStation(station.id)}
              />
            ))
          ) : (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No favorite stations yet. Tap on a station on the map to add it to favorites.
            </Text>
          )}

          <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 24 }]}>
            Favorite Trips
          </Text>
          {favoriteTrips.length > 0 ? (
            favoriteTrips.map((trip) => (
              <FavoriteTripCard
                key={trip.id}
                trip={trip}
                fromStationName={favoriteStations.find(s => s.id === trip.fromStationId)?.name}
                toStationName={favoriteStations.find(s => s.id === trip.toStationId)?.name}
                onRemove={() => removeFavoriteTrip(trip.id)}
              />
            ))
          ) : (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No favorite trips yet.
            </Text>
          )}
        </View>
      );
    }

    return (
      <View>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          GO Transit Live
        </Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          Track live GO train and bus positions in real-time.
        </Text>
        <View style={styles.legendContainer}>
          <Text style={[styles.legendTitle, { color: theme.colors.text }]}>
            Legend
          </Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.station }]} />
            <Text style={[styles.legendText, { color: theme.colors.text }]}>
              Station
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.train }]} />
            <Text style={[styles.legendText, { color: theme.colors.text }]}>
              Train
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.bus }]} />
            <Text style={[styles.legendText, { color: theme.colors.text }]}>
              Bus
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.colors.card }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.border }}
    >
      {!selectedMarker && (
        <View style={[styles.tabContainer, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'info' && { borderBottomColor: theme.colors.primary }
            ]}
            onPress={() => setActiveTab('info')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'info' ? theme.colors.primary : theme.colors.textSecondary }
            ]}>
              Info
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'favorites' && { borderBottomColor: theme.colors.primary }
            ]}
            onPress={() => setActiveTab('favorites')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'favorites' ? theme.colors.primary : theme.colors.textSecondary }
            ]}>
              Favorites
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <BottomSheetScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { backgroundColor: theme.colors.card }
        ]}
      >
        {renderContent()}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
  },
  legendContainer: {
    marginTop: 24,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendText: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
