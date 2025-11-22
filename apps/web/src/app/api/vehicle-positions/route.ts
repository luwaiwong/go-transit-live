import { NextResponse } from 'next/server';
import { fetchVehiclePositions } from '@go-transit-ontario/shared';

export async function GET() {
    try {
        const positions = await fetchVehiclePositions();
        return NextResponse.json(positions);
    } catch (error) {
        console.error('Error fetching vehicle positions:', error);
        return NextResponse.json({ error: 'Failed to fetch vehicle positions' }, { status: 500 });
    }
}
