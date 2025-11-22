import { NextResponse } from 'next/server';
import { fetchDirectTripNow, fetchDirectTripsForDay } from '@go-transit-ontario/shared';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const date = searchParams.get('date');
        const time = searchParams.get('time');
        const fullDay = searchParams.get('fullDay') === 'true';

        if (!from || !to) {
            return NextResponse.json({ error: 'Missing required parameters: from and to' }, { status: 400 });
        }

        const queryDate = date ? new Date(date) : new Date();

        if (fullDay) {
            const journeys = await fetchDirectTripsForDay(queryDate, from, to);
            return NextResponse.json(journeys);
        } else {
            const journeys = await fetchDirectTripNow(queryDate, from, to);
            return NextResponse.json(journeys);
        }
    } catch (error) {
        console.error('Error fetching journey:', error);
        return NextResponse.json({ error: 'Failed to fetch journey' }, { status: 500 });
    }
}
