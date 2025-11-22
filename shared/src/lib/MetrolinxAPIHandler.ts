import { Stop, Line, StopDetails, NextService, NextServiceResponse, Journey, Service, UIServiceInfo, VehiclePositionResponse } from './MetrolinxTypes';

const METROLINX_API_URL = "https://api.openmetrolinx.com/OpenDataAPI/api/V1";
const METROLINX_API_KEY = process.env.NX_EXPO_METROLINX_API_KEY;

const DEBUG = process.env.NX_DEBUG_API_LOGGING === 'true' || false;

function formatDateYYYYMMDD(date: Date): string {
    return date.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/-/g, '');
}

function formatTimeHHMM(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}${minutes}`;
}

function parseDateTimeString(dateTimeStr: string): Date {
    return new Date(dateTimeStr.replace(' ', 'T'));
}

async function metrolinxFetch(endpoint: string): Promise<any> {
    if (!METROLINX_API_KEY) {
        throw new Error("Metrolinx API key is not provided.");
    }
    const url = `${METROLINX_API_URL}${endpoint}?key=${METROLINX_API_KEY}`;
    if (DEBUG) console.log("Fetching:", url);

    const response = await fetch(url);
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Metrolinx API Error:", response.status, errorText);
        throw new Error(`Metrolinx API request failed with status ${response.status}`);
    }
    try {
        const data = await response.json();
        if (DEBUG) console.log("Response Data:", data);
        return data;
    } catch (e) {
        console.error("Error parsing JSON response from Metrolinx API", e);
        throw new Error("Invalid JSON response from Metrolinx API");
    }
}

export async function fetchStops(): Promise<Stop[]> {
    console.log("Fetching all active stops");
    const data = await metrolinxFetch("/stop/all");

    // Ensure result exists and is an array
    if (!data || !data.Stations || !Array.isArray(data.Stations.Station)) {
        console.error("Invalid response structure from /stop/all:", data);
        return [];
    }

    return data.Stations.Station;
}

export async function fetchLines(): Promise<Line[]> {
    console.log("Getting Line Data");
    const today = formatDateYYYYMMDD(new Date());
    const data = await metrolinxFetch(`/schedule/line/all/${today}`);
    return data.result;
}

export async function fetchStopDetails(stopId: string): Promise<StopDetails | null> {
    if (!stopId) return null;
    console.log(`[fetchStopDetails] Fetching details for stop: ${stopId}`);

    try {
        const data = await metrolinxFetch(`/stop/details/${stopId}`);

        console.log('[fetchStopDetails] API Response:', {
            hasData: !!data,
            keys: data ? Object.keys(data) : [],
            hasResult: data && 'result' in data,
            resultType: typeof data?.result,
            resultValue: data?.result
        });

        // Check if result exists and is not undefined
        if (data && data.result !== undefined && data.result !== null) {
            return data.result;
        }

        console.log('[fetchStopDetails] No result in API response, trying alternate property');

        // Try alternate response structures
        if (data && typeof data === 'object') {
            // Check if the data itself is the stop details
            if ('LocationCode' in data) {
                return data as StopDetails;
            }
            // Check for common alternate property names
            for (const prop of ['Stop', 'StopDetail', 'Station', 'data']) {
                if (data[prop]) {
                    console.log(`[fetchStopDetails] Found data in ${prop} property`);
                    return data[prop];
                }
            }
        }

        console.warn(`[fetchStopDetails] No valid stop details found in response for ${stopId}`);
        return null;
    } catch (error) {
        console.error(`[fetchStopDetails] Error fetching stop details for ${stopId}:`, error);
        // If /stop/details fails, fall back to basic stop info from /stop/all
        console.log(`[fetchStopDetails] Falling back to basic stop info from /stop/all`);
        try {
            const allStopsData = await metrolinxFetch('/stop/all');
            if (allStopsData?.Stations?.Station) {
                const stop = allStopsData.Stations.Station.find((s: Stop) => s.LocationCode === stopId);
                if (stop) {
                    console.log(`[fetchStopDetails] Found basic stop info for ${stopId}`);
                    return stop as StopDetails;
                }
            }
        } catch (fallbackError) {
            console.error(`[fetchStopDetails] Fallback also failed:`, fallbackError);
        }
        return null;
    }
}

export async function fetchServiceForStop(stop: string): Promise<NextServiceResponse | null> {
    console.log(`Fetching next service for stop: ${stop}`);
    const data = await metrolinxFetch(`/stop/nextservice/${stop}`);
    return data.result;
}

export async function fetchDirectTripNow(time: Date, start: string, end: string, max: number = 10): Promise<Journey[] | null> {
    const formattedDate = formatDateYYYYMMDD(time);
    const hour = formatTimeHHMM(time);

    const endpoint = `/schedule/journey?from=${start}&to=${end}&date=${formattedDate}&time=${hour}&limit=${max}`;
    const data = await metrolinxFetch(endpoint);

    if (data && data.Journeys && data.Journeys.Journey) {
        const trips = data.Journeys.Journey.filter((service: Service) => service.Trips.trip.length === 1);
        const journeys: Journey[] = trips.map((service: Service) => ({
            From: start,
            To: end,
            Time: hour,
            Date: formattedDate,
            Services: [service]
        }));
        return journeys.sort((a, b) => {
            const timeA = parseDateTimeString(a.Services[0].StartTime).getTime();
            const timeB = parseDateTimeString(b.Services[0].StartTime).getTime();
            return timeA - timeB;
        });
    }
    return [];
}

export async function fetchDirectTripsForDay(date: Date, start: string, end: string, dayFactor: number = 2, max: number = 5): Promise<Journey[] | null> {
    const formattedDate = formatDateYYYYMMDD(date);
    const allTrips: Service[] = [];

    const promises = [];
    for (let i = 1; i <= 24 / dayFactor; i++) {
        const hour = `${String(i * dayFactor).padStart(2, '0')}00`;
        const endpoint = `/schedule/journey?from=${start}&to=${end}&date=${formattedDate}&time=${hour}&limit=${max}`;
        promises.push(metrolinxFetch(endpoint));
    }

    const results = await Promise.all(promises);

    results.forEach(data => {
        if (data && data.Journeys && data.Journeys.Journey) {
            data.Journeys.Journey.forEach((service: Service) => {
                if (service.Trips.trip.length === 1 && !allTrips.some(t => t.StartTime === service.StartTime)) {
                    allTrips.push(service);
                }
            });
        }
    });

    const journeys: Journey[] = allTrips.map((service: Service) => ({
        From: start,
        To: end,
        Time: service.StartTime.split(' ')[1] || '',
        Date: formattedDate,
        Services: [service]
    }));
    return journeys.sort((a, b) => {
        const timeA = parseDateTimeString(a.Services[0].StartTime).getTime();
        const timeB = parseDateTimeString(b.Services[0].StartTime).getTime();
        return timeA - timeB;
    });
}

export async function getUIServiceData(stop: string, line: string, activeStops: Stop[], lines: Line[]): Promise<UIServiceInfo[]> {
    const startInfo = activeStops.find(s => s.LocationCode === stop);
    const lineInfo = lines.find(l => l.Code === line);
    const data = await fetchServiceForStop(stop);

    if (!data || !data.Lines) {
        return [];
    }

    const uiData: UIServiceInfo[] = data.Lines.map((service: NextService) => {
        const endName = service.DirectionName.split(" - ")[1];
        const endStop = activeStops.find(s => s.LocationName === endName);

        let departure = service.ScheduledDepartureTime;
        let platform = service.ScheduledPlatform;
        let status = service.Status;
        let departureChanged = false;
        let platformChanged = false;

        if (service.ActualPlatform !== service.ScheduledPlatform) {
            platform = service.ActualPlatform;
            platformChanged = true;
        }

        if (service.ComputedDepartureTime && service.ComputedDepartureTime !== service.ScheduledDepartureTime) {
            departure = service.ComputedDepartureTime;
            departureChanged = true;
        }

        return {
            LineCode: service.LineCode,
            StartCode: stop,
            StartName: startInfo?.LocationName || "",
            EndCode: endStop?.LocationCode || "",
            LineName: lineInfo?.Name || "",
            EndName: endName,
            DepartureTime: departure,
            Platform: platform,
            Status: status,
            DepartureChanged: departureChanged,
            PlatformChanged: platformChanged,
        };
    });

    return uiData;
}

export async function fetchVehiclePositions(): Promise<VehiclePositionResponse | null> {
    console.log("Fetching vehicle positions (GTFS real-time feed)");
    const data = await metrolinxFetch("/Gtfs/Feed/VehiclePosition");
    return data;
}
