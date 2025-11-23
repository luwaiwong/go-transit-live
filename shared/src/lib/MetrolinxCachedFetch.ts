import { Stop, Line } from './MetrolinxTypes';
import { useUserStore } from './UserStore';

/**
 * Client-side cached fetch for stops
 * Checks UserStore cache before making API call
 */
export async function fetchStopsCached(): Promise<Stop[]> {
  const store = useUserStore.getState();

  // Check if we should use cached data
  if (!store.shouldRefetchStops()) {
    console.log('Using cached stops data');
    return store.stops;
  }

  // Fetch fresh data from API
  console.log('Fetching fresh stops data from API');
  const response = await fetch('/api/stops');

  if (!response.ok) {
    throw new Error(`Failed to fetch stops: ${response.status}`);
  }

  const stops: Stop[] = await response.json();

  // Update cache
  store.setStops(stops);

  return stops;
}

/**
 * Client-side cached fetch for lines
 * Checks UserStore cache before making API call
 */
export async function fetchLinesCached(): Promise<Line[]> {
  const store = useUserStore.getState();

  // Check if we should use cached data
  if (!store.shouldRefetchLines()) {
    console.log('Using cached lines data');
    return store.lines;
  }

  // Fetch fresh data from API
  console.log('Fetching fresh lines data from API');
  const response = await fetch('/api/lines');

  if (!response.ok) {
    throw new Error(`Failed to fetch lines: ${response.status}`);
  }

  const lines: Line[] = await response.json();

  // Update cache
  store.setLines(lines);

  return lines;
}
