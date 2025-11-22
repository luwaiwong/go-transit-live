import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const stopId = params.id;

        // Read the station details JSON file
        const filePath = path.join(process.cwd(), 'station_details.json');
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const stationData = JSON.parse(fileContents);

        // Get the stop details for the requested ID
        const stopDetails = stationData[stopId];

        // Check if stop exists
        if (!stopDetails) {
            return NextResponse.json(
                { error: `Stop ${stopId} not found` },
                { status: 404 }
            );
        }

        // Return the stop details directly
        // NextResponse.json() already handles JSON serialization properly
        return NextResponse.json(stopDetails);
    } catch (error) {
        console.error('Error fetching stop details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stop details' },
            { status: 500 }
        );
    }
}
