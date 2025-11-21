import { NextResponse } from 'next/server';
import { fetchStops } from '@go-transit-ontario/shared';

export async function GET() {
    try {
        const stops = await fetchStops();
        return NextResponse.json(stops);
    } catch (error) {
        console.error('Error fetching stops:', error);
        return NextResponse.json({ error: 'Failed to fetch stops' }, { status: 500 });
    }
}
