import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Khao San',
  description: 'Khao San terms of service and conditions of use.',
};

export default function TermsPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }}>
      <div className="container" style={{ padding: '120px max(8vw, 24px)', maxWidth: '900px', margin: '0 auto' }}>
        <Link href="/" style={{ color: 'var(--color-primary)', textDecoration: 'none', marginBottom: '48px', display: 'inline-block' }}>← Back to Home</Link>

        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '48px', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>Terms of Service</h1>

        <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
          <h2 style={{ fontSize: '1.5rem', marginTop: '40px', marginBottom: '24px', color: 'var(--color-text-primary)' }}>Agreement to Terms</h2>
          <p>By accessing and using the Khao San website, you accept and agree to be bound by the terms and provision of this agreement.</p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '40px', marginBottom: '24px', color: 'var(--color-text-primary)' }}>Use License</h2>
          <p>Permission is granted to temporarily download one copy of the materials (information or software) on the Khao San website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
          <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to decompile or reverse engineer any software contained on the Site</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', marginTop: '40px', marginBottom: '24px', color: 'var(--color-text-primary)' }}>Disclaimer</h2>
          <p>The materials on the Khao San website are provided &ldquo;as is&rdquo;. Khao San makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '40px', marginBottom: '24px', color: 'var(--color-text-primary)' }}>Limitations</h2>
          <p>In no event shall Khao San or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the Khao San website.</p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '40px', marginBottom: '24px', color: 'var(--color-text-primary)' }}>Accuracy of Materials</h2>
          <p>The materials appearing on the Khao San website could include technical, typographical, or photographic errors. Khao San does not warrant that any of the materials on the website are accurate, complete, or current.</p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '40px', marginBottom: '24px', color: 'var(--color-text-primary)' }}>Links</h2>
          <p>Khao San has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Khao San of the site. Use of any such linked website is at the user&apos;s own risk.</p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '40px', marginBottom: '24px', color: 'var(--color-text-primary)' }}>Modifications</h2>
          <p>Khao San may revise these terms of service for the website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.</p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '40px', marginBottom: '24px', color: 'var(--color-text-primary)' }}>Contact Us</h2>
          <p>If you have any questions about these terms and conditions, please reach us on WhatsApp at +88 01600-068193 or message us on <a href="https://www.facebook.com/KhaoSanDhaka" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>Facebook</a>.</p>

          <p style={{ marginTop: '60px', fontSize: '0.9rem', opacity: 0.6 }}>Last updated: July 12, 2026</p>
        </div>
      </div>
    </main>
  );
}
