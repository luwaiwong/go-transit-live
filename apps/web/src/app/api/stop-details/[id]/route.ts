import { NextResponse } from 'next/server';
import { fetchStopDetails } from '@go-transit-ontario/shared';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log('[stop-details] Fetching details for stop:', id);
        const stopDetails = await fetchStopDetails(id);

        console.log('[stop-details] Raw response:', {
            type: typeof stopDetails,
            isNull: stopDetails === null,
            isUndefined: stopDetails === undefined,
            value: stopDetails
        });

        // Check if stopDetails is null or undefined
        if (stopDetails === null || stopDetails === undefined) {
            console.error('[stop-details] Stop details not found or API returned null/undefined');
            return NextResponse.json({ error: 'Stop details not found' }, { status: 404 });
        }

        // Ensure data is JSON serializable
        return NextResponse.json(stopDetails);
    } catch (error) {
        console.error('[stop-details] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch stop details' }, { status: 500 });
    }
}
