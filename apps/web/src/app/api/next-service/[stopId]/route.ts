import { NextResponse } from 'next/server';
import { fetchServiceForStop } from '@go-transit-ontario/shared';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ stopId: string }> }
) {
    try {
        const { stopId } = await params;
        const service = await fetchServiceForStop(stopId);
        return NextResponse.json(service);
    } catch (error) {
        console.error('Error fetching next service:', error);
        return NextResponse.json({ error: 'Failed to fetch next service' }, { status: 500 });
    }
}
