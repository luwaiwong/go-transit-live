import { NextResponse } from 'next/server';
import { fetchStopDetails } from '@go-transit-ontario/shared';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const stopDetails = await fetchStopDetails(id);
        return NextResponse.json(stopDetails);
    } catch (error) {
        console.error('Error fetching stop details:', error);
        return NextResponse.json({ error: 'Failed to fetch stop details' }, { status: 500 });
    }
}
