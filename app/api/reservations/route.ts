import { NextRequest, NextResponse } from 'next/server';

interface ReservationPayload {
    branch: string;
    date: string;
    time: string;
    partySize: string;
    name: string;
    phone: string;
    notes?: string;
}

const VALID_BRANCHES = ['gulshan', 'dhanmondi', 'uttara'];
const VALID_PARTY_SIZES = ['2', '3', '4', '5+'];

function isValidPayload(data: Partial<ReservationPayload>): data is ReservationPayload {
    if (!data.branch || !VALID_BRANCHES.includes(data.branch)) return false;
    if (!data.date || Number.isNaN(Date.parse(data.date))) return false;
    if (!data.time) return false;
    if (!data.partySize || !VALID_PARTY_SIZES.includes(data.partySize)) return false;
    if (!data.name || data.name.trim().length < 2) return false;
    if (!data.phone || data.phone.trim().length < 7) return false;
    return true;
}

export async function POST(req: NextRequest) {
    let body: Partial<ReservationPayload>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    if (!isValidPayload(body)) {
        return NextResponse.json({ error: 'Please fill in all required fields correctly.' }, { status: 422 });
    }

    const requestedDate = new Date(body.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (requestedDate < today) {
        return NextResponse.json({ error: 'Reservation date cannot be in the past.' }, { status: 422 });
    }

    const confirmationCode = `KS-${Date.now().toString(36).toUpperCase()}`;

    // NOTE: No persistent store is connected yet. This endpoint validates the
    // request and returns a confirmation code so the frontend flow is complete
    // end-to-end. Wire this to a database or notification service (email/SMS/
    // WhatsApp Business API) here when one is available - the contract
    // (request/response shape) below is stable and won't need to change.
    return NextResponse.json({
        success: true,
        confirmationCode,
        branch: body.branch,
        date: body.date,
        time: body.time,
    }, { status: 201 });
}
