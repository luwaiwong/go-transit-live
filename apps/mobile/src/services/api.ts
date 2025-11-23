import axios from 'axios';
import { StationData, Vehicle, MapMarker, Arrival } from '../types';

const API_BASE_URL = 'http://localhost:3000/api'; // Change this to your API endpoint

// In production, you might want to use environment variables
// const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const fetchStationDetails = async (): Promise<StationData> => {
  try {
    // For now, we'll load the local JSON file
    // In production, this should be an API call
    const response = await fetch('../../station_details.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching station details:', error);
    throw error;
  }
};

export const fetchStopDetails = async (stopId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stop-details/${stopId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stop details:', error);
    throw error;
  }
};

export const fetchVehiclePositions = async (): Promise<Vehicle[]> => {
  try {
    // This would be your actual API endpoint for vehicle positions
    // For now, returning empty array
    // You'll need to implement the API endpoint for vehicle positions
    const response = await axios.get(`${API_BASE_URL}/vehicle-positions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicle positions:', error);
    return [];
  }
};

export const getStationMarkers = (stationData: StationData, showOnlyTrains: boolean = true): MapMarker[] => {
  const markers: MapMarker[] = [];

  Object.entries(stationData).forEach(([id, data]) => {
    const stop = data.Stop;

    if (showOnlyTrains && !stop.IsTrain) {
      return;
    }

    if (stop.Longitude && stop.Latitude) {
      markers.push({
        id,
        name: stop.StopName,
        position: {
          latitude: parseFloat(stop.Latitude),
          longitude: parseFloat(stop.Longitude),
        },
        type: 'station',
      });
    }
  });

  return markers;
};

export const getVehicleMarkers = (vehicles: Vehicle[]): MapMarker[] => {
  return vehicles.map(vehicle => ({
    id: vehicle.id,
    name: vehicle.label,
    position: {
      latitude: vehicle.position.latitude,
      longitude: vehicle.position.longitude,
    },
    type: vehicle.type,
  }));
};

export const fetchStationArrivals = async (stopId: string): Promise<Arrival[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/arrivals/${stopId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching station arrivals:', error);
    // Return mock data for development
    return [
      {
        routeName: 'Lakeshore West',
        destination: 'Union Station',
        arrivalTime: '5 min',
        platform: '1',
        status: 'On Time',
      },
      {
        routeName: 'Lakeshore East',
        destination: 'Oshawa',
        arrivalTime: '12 min',
        platform: '2',
        status: 'On Time',
      },
    ];
  }
};
