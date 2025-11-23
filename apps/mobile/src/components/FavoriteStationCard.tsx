import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { FavoriteStation, Arrival } from '../types';
import { fetchStationArrivals } from '../services/api';

interface FavoriteStationCardProps {
  station: FavoriteStation;
  onPress?: () => void;
  onRemove?: () => void;
}

export const FavoriteStationCard = ({ station, onPress, onRemove }: FavoriteStationCardProps) => {
  const { theme } = useTheme();
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadArrivals();
    // Refresh arrivals every 30 seconds
    const interval = setInterval(loadArrivals, 30000);
    return () => clearInterval(interval);
  }, [station.id]);

  const loadArrivals = async () => {
    setLoading(true);
    try {
      const data = await fetchStationArrivals(station.id);
      setArrivals(data.slice(0, 2)); // Show only next 2 arrivals
    } catch (error) {
      console.error('Error loading arrivals:', error);
    } finally {
      setLoading(false);
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
          <Text style={[styles.stationName, { color: theme.colors.text }]}>
            {station.name}
          </Text>
          <View style={styles.badges}>
            {station.isTrain && (
              <View style={[styles.badge, { backgroundColor: theme.colors.train }]}>
                <Text style={styles.badgeText}>🚆</Text>
              </View>
            )}
            {station.isBus && (
              <View style={[styles.badge, { backgroundColor: theme.colors.bus }]}>
                <Text style={styles.badgeText}>🚌</Text>
              </View>
            )}
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      ) : (
        <View style={styles.arrivalsContainer}>
          {arrivals.length > 0 ? (
            arrivals.map((arrival, index) => (
              <View key={index} style={styles.arrivalRow}>
                <Text style={[styles.routeName, { color: theme.colors.text }]} numberOfLines={1}>
                  {arrival.routeName}
                </Text>
                <Text style={[styles.destination, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                  → {arrival.destination}
                </Text>
                <Text style={[styles.arrivalTime, { color: theme.colors.primary }]}>
                  {arrival.arrivalTime}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.noArrivals, { color: theme.colors.textSecondary }]}>
              No upcoming arrivals
            </Text>
          )}
        </View>
      )}
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
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  stationName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
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
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  arrivalsContainer: {
    gap: 8,
  },
  arrivalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  destination: {
    fontSize: 12,
    flex: 2,
  },
  arrivalTime: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
  noArrivals: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
