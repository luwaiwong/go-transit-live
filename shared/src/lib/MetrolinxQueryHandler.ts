
import { QueryClient, useQuery } from "@tanstack/react-query";
import * as MetrolinxAPI from "./MetrolinxAPIHandler";
import { Stop, Line, NextServiceResponse, Journey, UIServiceInfo } from "./MetrolinxTypes";

export const MetrolinxQueryHandler = new QueryClient({
  defaultOptions: {
    queries: {
        gcTime:1000 * 60 * 60, // 1 hour
        staleTime: 1000 * 60 * 25, // 25 minutes
    },
  }
})

export function useStopsQuery(): ReturnType<typeof useQuery<Stop[], Error>> {
  return useQuery({
    queryKey: ['stops'],
    queryFn: MetrolinxAPI.fetchStops,
  });
}

export function useLinesQuery(): ReturnType<typeof useQuery<Line[], Error>> {
  return useQuery({
    queryKey: ['lines'],
    queryFn: MetrolinxAPI.fetchLines,
  });
}

export function useStopDetailsQuery(stopId: string): ReturnType<typeof useQuery> {
    return useQuery({
        queryKey: ['stopDetails', stopId],
        queryFn: () => MetrolinxAPI.fetchStopDetails(stopId),
        enabled: !!stopId, // Only run query if stopId is available
    });
}

export function useServiceForStopQuery(stop: string): ReturnType<typeof useQuery<NextServiceResponse | null, Error>> {
    return useQuery({
        queryKey: ['serviceForStop', stop],
        queryFn: () => MetrolinxAPI.fetchServiceForStop(stop),
        enabled: !!stop,
    });
}

export function useDirectTripNowQuery(start: string, end: string, max: number = 10): ReturnType<typeof useQuery<Journey[] | null, Error>> {
    return useQuery({
        queryKey: ['directTripNow', start, end, max],
        queryFn: () => MetrolinxAPI.fetchDirectTripNow(new Date(), start, end, max),
        enabled: !!start && !!end,
    });
}

export function useDirectTripsForDayQuery(date: Date, start: string, end: string, dayFactor: number = 2, max: number = 5): ReturnType<typeof useQuery<Journey[] | null, Error>> {
    return useQuery({
        queryKey: ['directTripsForDay', date, start, end, dayFactor, max],
        queryFn: () => MetrolinxAPI.fetchDirectTripsForDay(date, start, end, dayFactor, max),
        enabled: !!date && !!start && !!end,
    });
}

export function useUIServiceDataQuery(stop: string, line: string, activeStops: Stop[], lines: Line[]): ReturnType<typeof useQuery<UIServiceInfo[], Error>> {
    return useQuery({
        queryKey: ['uiServiceData', stop, line, activeStops, lines],
        queryFn: () => MetrolinxAPI.getUIServiceData(stop, line, activeStops, lines),
        enabled: !!stop && !!line && !!activeStops && !!lines,
    });
}
