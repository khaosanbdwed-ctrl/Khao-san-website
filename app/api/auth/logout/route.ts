import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true }, { status: 200 });
    
    // Clear cookie
    response.cookies.set({
        name: 'khao_san_admin_session',
        value: '',
        httpOnly: true,
        path: '/',
        expires: new Date(0),
    });
    
    return response;
}
