import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { DOC_META, type DocKey } from '@/lib/cms/schema';
import { listDocStatus, CmsError } from '@/lib/cms/admin-store';

/** Live counts and statuses - never prerendered. */
export const dynamic = 'force-dynamic';

const ORDER: DocKey[] = ['home', 'menu', 'navigation', 'locations', 'theme', 'site', 'privacy', 'terms'];

export default async function AdminDashboard() {
    const supabase = createAdminClient();
    const [{ count: dishCount }, { count: categoryCount }] = await Promise.all([
        supabase.from('menu_items').select('*', { count: 'exact', head: true }),
        supabase.from('menu_categories').select('*', { count: 'exact', head: true }),
    ]);

    let statuses: Awaited<ReturnType<typeof listDocStatus>> | null = null;
    let setupError: string | null = null;
    try {
        statuses = await listDocStatus();
    } catch (e) {
        setupError = e instanceof CmsError ? e.message : 'Could not reach the database.';
    }
    const status = (key: DocKey) => statuses?.find(s => s.key === key);
    const draftCount = statuses?.filter(s => s.hasDraft).length ?? 0;

    return (
        <div className="cms-page">
            <div className="cms-page-head">
                <div>
                    <h1>Website editor</h1>
                    <p>Change any words, photos, videos, buttons, colours or fonts on the site. Edits are saved as drafts automatically and go live when you press <strong>Publish</strong>.</p>
                </div>
                <a className="cms-btn" href="/" target="_blank" rel="noopener">View the website</a>
            </div>

            {setupError && (
                <div className="cms-alert cms-alert--warn">
                    <h3>One-time setup needed</h3>
                    <p>{setupError}</p>
                    <p>Until then the website keeps showing its original content, and the menu manager works as before.</p>
                </div>
            )}

            {draftCount > 0 && (
                <div className="cms-alert cms-alert--info">
                    {draftCount === 1 ? 'One area has' : `${draftCount} areas have`} unpublished changes - marked below. Open {draftCount === 1 ? 'it' : 'each'} and press Publish when you are ready.
                </div>
            )}

            <div className="cms-grid" style={{ marginBottom: 28 }}>
                <Link href="/admin/menu" className="cms-card cms-tile">
                    <h3>Menu dishes</h3>
                    <p>Add, edit, reorder and photograph dishes and categories. Changes go live immediately.</p>
                    <span className="cms-pill cms-pill--ok">{dishCount ?? '—'} dishes · {categoryCount ?? '—'} categories</span>
                </Link>
                {ORDER.map(key => {
                    const s = status(key);
                    return (
                        <Link key={key} href={`/admin/content/${key}`} className="cms-card cms-tile">
                            <h3>{DOC_META[key].title}</h3>
                            <p>{DOC_META[key].description}</p>
                            {s?.hasDraft ? <span className="cms-pill cms-pill--draft">Unpublished changes</span>
                                : s?.publishedAt ? <span className="cms-pill cms-pill--ok">Published {new Date(s.publishedAt).toLocaleDateString()}</span>
                                : <span className="cms-pill">Original content</span>}
                        </Link>
                    );
                })}
                <Link href="/admin/media" className="cms-card cms-tile">
                    <h3>Media library</h3>
                    <p>Every photo, video and font you have uploaded. Upload here, or straight from any image field.</p>
                </Link>
            </div>

            <div className="cms-card cms-card-pad">
                <h2 style={{ fontSize: 17, margin: '0 0 10px' }}>How it works</h2>
                <ol className="cms-steps">
                    <li>Open an area above. The form is on the left and the real website is on the right.</li>
                    <li>Type, choose photos, drag sections and items into a new order. The preview updates as you go.</li>
                    <li>Your work saves itself as a draft. Visitors do not see it yet.</li>
                    <li>Press <strong>Publish</strong> to put it live. Every published version is kept under <strong>History</strong>, so anything can be undone.</li>
                </ol>
            </div>
        </div>
    );
}
