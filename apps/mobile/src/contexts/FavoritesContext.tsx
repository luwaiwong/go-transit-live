import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FavoriteStation, FavoriteTrip } from '../types';
import {
  getFavoriteStations,
  addFavoriteStation as addStation,
  removeFavoriteStation as removeStation,
  getFavoriteTrips,
  addFavoriteTrip as addTrip,
  removeFavoriteTrip as removeTrip,
} from '../services/favorites';

interface FavoritesContextType {
  favoriteStations: FavoriteStation[];
  favoriteTrips: FavoriteTrip[];
  addFavoriteStation: (station: FavoriteStation) => Promise<void>;
  removeFavoriteStation: (stationId: string) => Promise<void>;
  isFavoriteStation: (stationId: string) => boolean;
  addFavoriteTrip: (trip: FavoriteTrip) => Promise<void>;
  removeFavoriteTrip: (tripId: string) => Promise<void>;
  isFavoriteTrip: (tripId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
  const [favoriteStations, setFavoriteStations] = useState<FavoriteStation[]>([]);
  const [favoriteTrips, setFavoriteTrips] = useState<FavoriteTrip[]>([]);

  const loadFavorites = async () => {
    try {
      const [stations, trips] = await Promise.all([
        getFavoriteStations(),
        getFavoriteTrips(),
      ]);
      setFavoriteStations(stations);
      setFavoriteTrips(trips);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleAddFavoriteStation = async (station: FavoriteStation) => {
    await addStation(station);
    await loadFavorites();
  };

  const handleRemoveFavoriteStation = async (stationId: string) => {
    await removeStation(stationId);
    await loadFavorites();
  };

  const handleIsFavoriteStation = (stationId: string): boolean => {
    return favoriteStations.some(s => s.id === stationId);
  };

  const handleAddFavoriteTrip = async (trip: FavoriteTrip) => {
    await addTrip(trip);
    await loadFavorites();
  };

  const handleRemoveFavoriteTrip = async (tripId: string) => {
    await removeTrip(tripId);
    await loadFavorites();
  };

  const handleIsFavoriteTrip = (tripId: string): boolean => {
    return favoriteTrips.some(t => t.id === tripId);
  };

  const value: FavoritesContextType = {
    favoriteStations,
    favoriteTrips,
    addFavoriteStation: handleAddFavoriteStation,
    removeFavoriteStation: handleRemoveFavoriteStation,
    isFavoriteStation: handleIsFavoriteStation,
    addFavoriteTrip: handleAddFavoriteTrip,
    removeFavoriteTrip: handleRemoveFavoriteTrip,
    isFavoriteTrip: handleIsFavoriteTrip,
    refreshFavorites: loadFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
