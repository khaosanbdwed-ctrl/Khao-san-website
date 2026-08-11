import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            const response = NextResponse.json({ success: true }, { status: 200 });
            
            // Set cookie for 7 days
            response.cookies.set({
                name: 'khao_san_admin_session',
                value: 'authenticated',
                httpOnly: true,
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7, // 1 week
            });
            
            return response;
        }

        return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
        );
    } catch {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
