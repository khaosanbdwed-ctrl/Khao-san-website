import { NextResponse } from 'next/server';

// Temporary mock data structure to mimic future Supabase response
let mockMenuData = [
    { id: 1, name: 'Tom Yum Goong', category: 'Soups', price: '৳ 850', description: 'Classic spicy & sour broth, river prawns, lemongrass, galangal, kaffir lime.', image: null },
    { id: 2, name: 'Som Tum Thai', category: 'Salads', price: '৳ 550', description: 'Green papaya, cherry tomatoes, snake beans, peanuts, tamarind-lime dressing.', image: null },
    { id: 3, name: 'Pad Thai Goong', category: 'Noodles', price: '৳ 750', description: 'Rice noodles, prawns, egg, tofu, peanuts, bean sprouts, tamarind glaze.', image: null },
    { id: 4, name: 'Gaeng Keow Wan', category: 'Curries', price: '৳ 780', description: 'Thai green curry, chicken, Thai eggplant, bamboo shoots, sweet basil.', image: null }
];

export async function GET() {
    // Future: const { data } = await supabase.from('menu_items').select('*')
    return NextResponse.json({ data: mockMenuData });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Future: await supabase.from('menu_items').insert([body])
        
        const newItem = {
            id: mockMenuData.length + 1,
            ...body
        };
        
        // Mock save
        mockMenuData.push(newItem);
        
        return NextResponse.json({ success: true, data: newItem });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
    }
}
