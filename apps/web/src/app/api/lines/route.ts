import { NextResponse } from 'next/server';
import { fetchLines } from '@go-transit-ontario/shared';

export async function GET() {
    try {
        const lines = await fetchLines();
        return NextResponse.json(lines);
    } catch (error) {
        console.error('Error fetching lines:', error);
        return NextResponse.json({ error: 'Failed to fetch lines' }, { status: 500 });
    }
}
