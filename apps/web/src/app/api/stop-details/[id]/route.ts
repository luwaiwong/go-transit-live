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

        // Log what the API actually returned for IsBus and IsTrain
        console.log('[stop-details] API returned - LocationType:', stopDetails.LocationType,
                    'IsBus:', stopDetails.IsBus, 'IsTrain:', stopDetails.IsTrain);

        // Ensure IsBus and IsTrain are properly set
        // If they're not already set by the API, infer from LocationType
        const needsInference = stopDetails.IsBus === undefined ||
                              stopDetails.IsBus === null ||
                              stopDetails.IsTrain === undefined ||
                              stopDetails.IsTrain === null;

        if (needsInference) {
            console.log('[stop-details] IsBus or IsTrain not set, inferring from LocationType');

            // GO Transit LocationType patterns - check common values
            // Common types: 'S' (Station), 'B' (Bus), or check the name/code
            const locationType = stopDetails.LocationType?.toUpperCase();

            if (locationType === 'S' || locationType === 'STATION') {
                stopDetails.IsTrain = true;
                stopDetails.IsBus = false;
            } else if (locationType === 'B' || locationType === 'BUS') {
                stopDetails.IsBus = true;
                stopDetails.IsTrain = false;
            } else {
                // If LocationType doesn't help, check the stop name or code patterns
                // GO Train stations often have names like "Union Station", "Oakville GO"
                // Bus stops often have route numbers
                const name = stopDetails.LocationName?.toLowerCase() || '';
                const code = stopDetails.LocationCode?.toLowerCase() || '';

                if (name.includes('station') || name.includes('go station')) {
                    stopDetails.IsTrain = true;
                    stopDetails.IsBus = false;
                } else if (name.includes('bus') || code.includes('bus')) {
                    stopDetails.IsBus = true;
                    stopDetails.IsTrain = false;
                } else {
                    // Default to train station for GO Transit
                    console.warn('[stop-details] Could not determine type for:', id, 'LocationType:', locationType);
                    stopDetails.IsTrain = true;
                    stopDetails.IsBus = false;
                }
            }

            console.log('[stop-details] Inferred - IsBus:', stopDetails.IsBus, 'IsTrain:', stopDetails.IsTrain);
        }

        // Ensure data is JSON serializable
        return NextResponse.json(stopDetails);
    } catch (error) {
        console.error('[stop-details] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch stop details' }, { status: 500 });
    }
}
