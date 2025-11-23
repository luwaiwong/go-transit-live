import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteStation, Arrival } from '../types';
import { fetchStationArrivals } from './api';

const WIDGET_DATA_KEY = '@go_transit_widget_data';
const SELECTED_WIDGET_STATION_KEY = '@go_transit_widget_station';

export interface WidgetData {
  selectedStationId: string;
  stationName: string;
  arrivals: Arrival[];
  lastUpdated: number;
}

/**
 * Get the currently selected station for the widget
 */
export const getWidgetStation = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(SELECTED_WIDGET_STATION_KEY);
  } catch (error) {
    console.error('Error getting widget station:', error);
    return null;
  }
};

/**
 * Set the station to display in the widget
 */
export const setWidgetStation = async (station: FavoriteStation): Promise<void> => {
  try {
    await AsyncStorage.setItem(SELECTED_WIDGET_STATION_KEY, station.id);
    // Also update the widget data
    await updateWidgetData(station);
  } catch (error) {
    console.error('Error setting widget station:', error);
    throw error;
  }
};

/**
 * Clear the widget station selection
 */
export const clearWidgetStation = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SELECTED_WIDGET_STATION_KEY);
    await AsyncStorage.removeItem(WIDGET_DATA_KEY);
  } catch (error) {
    console.error('Error clearing widget station:', error);
    throw error;
  }
};

/**
 * Update widget data with latest arrivals
 */
export const updateWidgetData = async (station: FavoriteStation): Promise<void> => {
  try {
    const arrivals = await fetchStationArrivals(station.id);

    const widgetData: WidgetData = {
      selectedStationId: station.id,
      stationName: station.name,
      arrivals: arrivals.slice(0, 5), // Limit to 5 arrivals for widget
      lastUpdated: Date.now(),
    };

    await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(widgetData));

    // Notify the widget to refresh (platform-specific implementation needed)
    notifyWidget();
  } catch (error) {
    console.error('Error updating widget data:', error);
    throw error;
  }
};

/**
 * Get the current widget data
 */
export const getWidgetData = async (): Promise<WidgetData | null> => {
  try {
    const data = await AsyncStorage.getItem(WIDGET_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting widget data:', error);
    return null;
  }
};

/**
 * Notify the native widget to refresh
 * This function should be implemented with native modules
 */
const notifyWidget = () => {
  // This would require a native module to communicate with the widget
  // For iOS: Use App Groups and notify via Darwin notification
  // For Android: Use Intent to update the widget

  // Example iOS implementation (requires native module):
  // WidgetModule.notifyUpdate();

  // Example Android implementation (requires native module):
  // WidgetModule.updateWidget();

  console.log('Widget notification sent (native implementation required)');
};

/**
 * Background task to refresh widget data periodically
 * This should be called from a background task
 */
export const refreshWidgetInBackground = async (): Promise<void> => {
  try {
    const stationId = await getWidgetStation();
    if (!stationId) {
      return;
    }

    // Fetch the station details from favorites
    // This would need to be implemented to get the full station object
    // For now, we'll just update with the station ID we have
    const arrivals = await fetchStationArrivals(stationId);

    const currentData = await getWidgetData();
    if (currentData) {
      const widgetData: WidgetData = {
        ...currentData,
        arrivals: arrivals.slice(0, 5),
        lastUpdated: Date.now(),
      };

      await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(widgetData));
      notifyWidget();
    }
  } catch (error) {
    console.error('Error refreshing widget in background:', error);
  }
};
