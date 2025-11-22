import { NextResponse } from 'next/server';
import { fetchStopDetails } from '@go-transit-ontario/shared';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const stopDetails = await fetchStopDetails(id);
        // Ensure data is JSON serializable by round-tripping through JSON
        // This handles undefined values, functions, and other non-serializable data
        return NextResponse.json(JSON.parse(JSON.stringify(stopDetails)));
    } catch (error) {
        console.error('Error fetching stop details:', error);
        return NextResponse.json({ error: 'Failed to fetch stop details' }, { status: 500 });
    }
}
