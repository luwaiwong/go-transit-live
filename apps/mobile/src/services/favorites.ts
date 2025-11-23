import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteStation, FavoriteTrip } from '../types';

const FAVORITES_STATIONS_KEY = '@go_transit_favorites_stations';
const FAVORITES_TRIPS_KEY = '@go_transit_favorites_trips';

// Favorite Stations
export const getFavoriteStations = async (): Promise<FavoriteStation[]> => {
  try {
    const data = await AsyncStorage.getItem(FAVORITES_STATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading favorite stations:', error);
    return [];
  }
};

export const addFavoriteStation = async (station: FavoriteStation): Promise<void> => {
  try {
    const favorites = await getFavoriteStations();
    const exists = favorites.some(s => s.id === station.id);

    if (!exists) {
      favorites.push(station);
      await AsyncStorage.setItem(FAVORITES_STATIONS_KEY, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Error adding favorite station:', error);
    throw error;
  }
};

export const removeFavoriteStation = async (stationId: string): Promise<void> => {
  try {
    const favorites = await getFavoriteStations();
    const updated = favorites.filter(s => s.id !== stationId);
    await AsyncStorage.setItem(FAVORITES_STATIONS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error removing favorite station:', error);
    throw error;
  }
};

export const isFavoriteStation = async (stationId: string): Promise<boolean> => {
  try {
    const favorites = await getFavoriteStations();
    return favorites.some(s => s.id === stationId);
  } catch (error) {
    console.error('Error checking favorite station:', error);
    return false;
  }
};

// Favorite Trips
export const getFavoriteTrips = async (): Promise<FavoriteTrip[]> => {
  try {
    const data = await AsyncStorage.getItem(FAVORITES_TRIPS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading favorite trips:', error);
    return [];
  }
};

export const addFavoriteTrip = async (trip: FavoriteTrip): Promise<void> => {
  try {
    const favorites = await getFavoriteTrips();
    const exists = favorites.some(t => t.id === trip.id);

    if (!exists) {
      favorites.push(trip);
      await AsyncStorage.setItem(FAVORITES_TRIPS_KEY, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Error adding favorite trip:', error);
    throw error;
  }
};

export const removeFavoriteTrip = async (tripId: string): Promise<void> => {
  try {
    const favorites = await getFavoriteTrips();
    const updated = favorites.filter(t => t.id !== tripId);
    await AsyncStorage.setItem(FAVORITES_TRIPS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error removing favorite trip:', error);
    throw error;
  }
};

export const isFavoriteTrip = async (tripId: string): Promise<boolean> => {
  try {
    const favorites = await getFavoriteTrips();
    return favorites.some(t => t.id === tripId);
  } catch (error) {
    console.error('Error checking favorite trip:', error);
    return false;
  }
};
