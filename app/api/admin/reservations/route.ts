import { NextResponse } from 'next/server';

let mockReservations = [
    { id: 1, name: 'John Doe', phone: '+88 01711223344', location: 'Gulshan 1', date: '2026-07-14', time: '19:30', guests: 4, status: 'Pending' },
    { id: 2, name: 'Sarah Ahmed', phone: '+88 01811223344', location: 'Dhanmondi', date: '2026-07-14', time: '20:00', guests: 2, status: 'Confirmed' },
    { id: 3, name: 'Imran Khan', phone: '+88 01911223344', location: 'Uttara', date: '2026-07-15', time: '13:00', guests: 6, status: 'Pending' }
];

export async function GET() {
    // Future: const { data } = await supabase.from('reservations').select('*').order('created_at', { ascending: false })
    return NextResponse.json({ data: mockReservations });
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, status } = body;
        
        // Future: await supabase.from('reservations').update({ status }).eq('id', id)
        
        mockReservations = mockReservations.map(res => 
            res.id === id ? { ...res, status } : res
        );
        
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 });
    }
}
