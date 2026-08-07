import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Khao San',
  description: 'Khao San privacy policy and data protection information.',
};

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }}>
      <div className="container" style={{ padding: '120px max(8vw, 24px)', maxWidth: '900px', margin: '0 auto' }}>
        <Link href="/" style={{ color: 'var(--color-primary)', textDecoration: 'none', marginBottom: '48px', display: 'inline-block' }}>← Back to Home</Link>

        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '48px', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>Privacy Policy</h1>

        <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
          <h2 style={{ fontSize: '1.5rem', marginTop: '40px', marginBottom: '24px', color: 'var(--color-text-primary)' }}>Introduction</h2>
          <p>Khao San (&ldquo;we&rdquo; or &ldquo;us&rdquo; or &ldquo;our&rdquo;) operates the https://www.khaosandhaka.com website (the &ldquo;Site&rdquo;).</p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '40px', marginBottom: '24px', color: 'var(--color-text-primary)' }}>Information We Collect</h2>
          <p>We collect information you voluntarily provide when you contact us, such as through WhatsApp or Facebook. This may include your name, phone number, and the details of your inquiry.</p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '40px', marginBottom: '24px', color: 'var(--color-text-primary)' }}>How We Use Your Information</h2>
          <p>We use the information we collect to respond to your inquiries, arrange reservations and gift card purchases, and improve our service.</p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '40px', marginBottom: '24px', color: 'var(--color-text-primary)' }}>Data Protection</h2>
          <p>We implement appropriate security measures to protect your personal information against unauthorized access or disclosure.</p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '40px', marginBottom: '24px', color: 'var(--color-text-primary)' }}>Contact Us</h2>
          <p>If you have any questions about this privacy policy, please reach us on WhatsApp at +88 01600-068193 or message us on <a href="https://www.facebook.com/KhaoSanDhaka" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>Facebook</a>.</p>

          <p style={{ marginTop: '60px', fontSize: '0.9rem', opacity: 0.6 }}>Last updated: August 6, 2026</p>
        </div>
      </div>
    </main>
  );
}
