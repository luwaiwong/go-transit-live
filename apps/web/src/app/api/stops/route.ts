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

        return NextResponse.json(stops);
    } catch (error) {
        console.error('Error fetching stops:', error);
        // Return empty array instead of error object to prevent client-side crashes
        return NextResponse.json([], { status: 200 });
    }
}
