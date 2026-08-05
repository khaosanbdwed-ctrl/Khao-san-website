import SecondaryVertical from "@/components/ui/demo";

export default function AdminOverview() {
    // In the future, this data will be fetched from PostHog / Vercel Analytics / Supabase
    const stats = [
        { label: 'Today\'s Reservations', value: '14' },
        { label: 'Active Menu Items', value: '42' },
        { label: 'Total Visitors (30d)', value: '1,248' },
        { label: '"Menu" Button Clicks', value: '386' }
    ];

    return (
        <div>
            <div style={{ marginBottom: '40px' }}>
                <h1 className="display-2" style={{ fontSize: '3rem', marginBottom: '8px' }}>Dashboard Overview</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>Welcome back to the Khao San command center.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                {stats.map((stat, i) => (
                    <div key={i} style={{ backgroundColor: 'var(--color-surface-base)', padding: '32px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
                        <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ backgroundColor: 'var(--color-surface-base)', padding: '40px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '16px' }}>Ready for Phase 3</h3>
                <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
                    The backend API structure is fully prepared. Once you provide the Supabase and Analytics credentials, this dashboard will instantly connect and display real-time data from your live systems. Use the sidebar to manage your menu and view incoming reservations.
                </p>
            </div>

            <div style={{ marginTop: '48px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '16px' }}>HeroUI Tabs Demo</h3>
                <SecondaryVertical />
            </div>
        </div>
    );
}
