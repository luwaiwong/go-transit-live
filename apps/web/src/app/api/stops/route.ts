import { NextResponse } from 'next/server';
import { fetchStops } from '@go-transit-ontario/shared';

export async function GET() {
    try {
        const stops = await fetchStops();

        // Ensure we always return an array
        if (!Array.isArray(stops)) {
            console.error('fetchStops did not return an array:', stops);
            return NextResponse.json([], { status: 200 });
        }

        console.log(`Successfully fetched ${stops.length} stops from Metrolinx API`);
        return NextResponse.json(stops);
    } catch (error: any) {
        console.error('Error fetching stops:', error);

        // Check for network/DNS errors
        if (error.cause?.code === 'EAI_AGAIN' || error.cause?.code === 'ENOTFOUND' || error.cause?.syscall === 'getaddrinfo') {
            console.error('DNS/Network Error: Cannot resolve api.openmetrolinx.com');
            console.error('This may be due to:');
            console.error('1. No internet connection');
            console.error('2. Firewall blocking the request');
            console.error('3. DNS server issues');
            console.error('Please check network connectivity and try again');
        }

        // Return empty array instead of error object to prevent client-side crashes
        return NextResponse.json([], { status: 200 });
    }
}
