import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { FavoriteTrip } from '../types';

interface FavoriteTripCardProps {
  trip: FavoriteTrip;
  fromStationName?: string;
  toStationName?: string;
  onPress?: () => void;
  onRemove?: () => void;
}

export const FavoriteTripCard = ({
  trip,
  fromStationName = 'Unknown',
  toStationName = 'Unknown',
  onPress,
  onRemove
}: FavoriteTripCardProps) => {
  const { theme } = useTheme();

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'train':
        return '🚆';
      case 'bus':
        return '🚌';
      default:
        return '🚉';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.tripName, { color: theme.colors.text }]}>
            {trip.name}
          </Text>
          <View style={styles.vehicleTypeContainer}>
            <Text style={styles.vehicleIcon}>{getVehicleIcon(trip.vehicleType)}</Text>
            <Text style={[styles.vehicleType, { color: theme.colors.textSecondary }]}>
              {trip.vehicleType.toUpperCase()}
            </Text>
          </View>
        </View>
        {onRemove && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onRemove}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.stationContainer}>
          <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
          <Text style={[styles.stationName, { color: theme.colors.text }]} numberOfLines={1}>
            {fromStationName}
          </Text>
        </View>

        <View style={styles.arrowContainer}>
          <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.arrow, { color: theme.colors.textSecondary }]}>→</Text>
        </View>

        <View style={styles.stationContainer}>
          <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
          <Text style={[styles.stationName, { color: theme.colors.text }]} numberOfLines={1}>
            {toStationName}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  tripName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  vehicleTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vehicleIcon: {
    fontSize: 14,
  },
  vehicleType: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  routeContainer: {
    gap: 8,
  },
  stationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stationName: {
    fontSize: 14,
    flex: 1,
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
  },
  line: {
    width: 2,
    height: 20,
    marginRight: 10,
  },
  arrow: {
    fontSize: 16,
  },
});
