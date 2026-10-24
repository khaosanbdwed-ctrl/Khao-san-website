// End-to-end: the restaurant team's dashboard workflows in a real browser -
// sign in, edit, preview, publish, restore, hide a section, upload a photo
// and a video, add/edit/delete a dish with a background-removed photo.
//   node qa/cms-e2e.mjs http://localhost:3400
import { chromium } from 'playwright';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const base = process.argv[2];
const USER = process.env.QA_USER || 'qa-admin', PASS = process.env.QA_PASS || 'Qa-Strong-Passw0rd-2026!';
const FX = new URL('./.fixtures/', import.meta.url).pathname;
const SHOTS = new URL('./.shots/e2e/', import.meta.url).pathname;
fs.mkdirSync(SHOTS, { recursive: true });
fs.mkdirSync(FX, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, n, x = '') => { if (c) { pass++; console.log('  PASS', n); } else { fail++; console.log('  FAIL', n, x); } };

const browser = await chromium.launch({ executablePath: process.env.QA_CHROMIUM || undefined });

/* Fixtures are drawn in the browser, so the suite needs nothing installed
   beyond Playwright: a large camera-style JPEG, a "dish" that still has its
   background (must be refused), and the repo's own transparent Pad Thai
   cut-out re-saved as PNG. A test video is made only if ffmpeg exists. */
{
    const p = await (await browser.newContext()).newPage();
    const draw = async (w, h, type, transparent) => Buffer.from(await p.evaluate(async ({ w, h, type, transparent }) => {
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const x = c.getContext('2d');
        if (!transparent) { x.fillStyle = '#f0e6dc'; x.fillRect(0, 0, w, h); }
        for (let i = 0; i < 300; i++) { x.fillStyle = `hsl(${(i * 37) % 360} 70% 55%)`; x.beginPath(); x.arc((i * 97) % w, (i * 53) % h, 40 + (i % 7) * 20, 0, 7); x.fill(); }
        const b = await new Promise(r => c.toBlob(r, type, 0.95));
        return Array.from(new Uint8Array(await b.arrayBuffer()));
    }, { w, h, type, transparent }));
    fs.writeFileSync(FX + 'camera-photo.jpg', await draw(3000, 2000, 'image/jpeg', false));
    fs.writeFileSync(FX + 'dish-with-background.png', await draw(1200, 1200, 'image/png', false));
    await p.goto('about:blank');
    const cut = fs.readFileSync(new URL('../assets-source/menu-cutouts/E. Noodles/Pad Thai.webp', import.meta.url));
    const png = await p.evaluate(async (bytes) => {
        const bmp = await createImageBitmap(new Blob([new Uint8Array(bytes)], { type: 'image/webp' }));
        const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height;
        c.getContext('2d').drawImage(bmp, 0, 0);
        const b = await new Promise(r => c.toBlob(r, 'image/png'));
        return Array.from(new Uint8Array(await b.arrayBuffer()));
    }, Array.from(cut));
    fs.writeFileSync(FX + 'cutout-pad-thai.png', Buffer.from(png));
    try {
        execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=size=1920x1080:rate=30', '-t', '25', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', FX + 'phone-video.mp4']);
    } catch { /* no ffmpeg: the video step is skipped */ }
    await p.context().close();
}
const HAS_VIDEO = fs.existsSync(FX + 'phone-video.mp4');

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [];
ctx.on('page', p => {
    p.on('console', m => { if (m.type() === 'error') consoleErrors.push(`${p.url()} :: ${m.text().slice(0, 240)}`); });
    p.on('pageerror', e => consoleErrors.push(`${p.url()} :: pageerror ${e.message.slice(0, 240)}`));
    p.on('dialog', d => d.accept());
});
const page = await ctx.newPage();
const publish = async () => {
    await Promise.all([
        page.waitForResponse(r => r.request().method() === 'POST' && /\/api\/admin\/content\//.test(r.url()) && r.ok(), { timeout: 30000 }),
        page.click('button:has-text("Publish")'),
    ]);
};

console.log('1. Sign in');
await page.goto(base + '/admin');
ok(page.url().includes('/admin/login'), 'dashboard redirects to login');
await page.fill('#admin-username', USER);
await page.fill('#admin-password', 'wrong-password');
await page.click('button[type=submit]');
await page.waitForSelector('form [role=alert]');
ok((await page.textContent('form [role=alert]')).includes('do not match'), 'wrong password shows a clear message');
await page.fill('#admin-password', PASS);
await page.click('button[type=submit]');
await page.waitForURL(base + '/admin', { timeout: 15000 });
ok(await page.isVisible('text=Dashboard Overview'), 'overview loads');
// 75 seeded dishes, 4 of them hidden by default (lib/menu-visibility.ts): the
// overview counts what the public menu shows, not raw database rows.
ok(await page.isVisible('text=71'), 'live dish count shown');
await page.screenshot({ path: SHOTS + 'admin-overview.png' });

console.log('2. Edit, preview, publish, restore');
await page.click('text=Website Content');
await page.waitForSelector('.cms-doc-card');
ok((await page.locator('.cms-doc-card').count()) === 7, 'seven editable areas');
await page.screenshot({ path: SHOTS + 'admin-content.png' });
await page.click('.cms-doc-card:has-text("Homepage")');
await page.waitForSelector('text=Opening (hero)');
await page.click('button:has-text("Opening (hero)")');
const title = page.locator('.cms-field:has(> .cms-field__label :text-is("Title")) > input').first();
await title.fill('The Thai Way QA');
ok(await page.isVisible('text=Unsaved changes'), 'unsaved state shown');
await page.click('button:has-text("Save draft")');
await page.waitForSelector('text=Draft saved');
ok(true, 'draft saved');
const anon = await browser.newContext();
const ap = await anon.newPage();
await ap.goto(base + '/');
ok(!(await ap.content()).includes('The Thai Way QA'), 'public site unchanged by a draft');
const [preview] = await Promise.all([ctx.waitForEvent('page'), page.click('button:has-text("Preview")')]);
await preview.waitForLoadState('networkidle');
ok((await preview.content()).includes('The Thai Way QA'), 'preview shows the draft');
ok(await preview.isVisible('.cms-preview-bar'), 'preview bar visible');
await preview.screenshot({ path: SHOTS + 'preview.png' });
await Promise.all([preview.waitForResponse(r => r.url().includes('/api/preview/exit')), preview.click('button:has-text("Exit preview")')]);
await preview.waitForTimeout(2500);
ok(!(await preview.isVisible('.cms-preview-bar')), 'exit preview works');
await preview.close();
await publish();
await ap.goto(base + '/');
ok((await ap.content()).includes('The Thai Way QA'), 'publish is live immediately');
await page.click('button:has-text("History")');
ok((await page.locator('.cms-history__row').count()) >= 1, 'history lists the publish');
await page.click('button:has-text("Reset all to original")');
await publish();
await ap.goto(base + '/');
ok(!(await ap.content()).includes('The Thai Way QA') && (await ap.content()).includes('The Thai Way'), 'reset to original + publish restores the design copy');

console.log('3. Section show/hide and reorder');
await page.reload();
await page.waitForSelector('text=Gift cards');
const giftSwitch = page.locator('.cms-section:has-text("Gift cards") .cms-switch input');
await giftSwitch.uncheck();
await publish();
await ap.goto(base + '/');
ok((await ap.locator('#gift').count()) === 0, 'hidden section removed from the site');
await page.locator('.cms-section:has-text("Gift cards") .cms-switch input').check();
await publish();
await ap.goto(base + '/');
ok((await ap.locator('#gift').count()) === 1, 'section shown again');

console.log('4. Media library: photo and video uploads');
await page.goto(base + '/admin/media');
await page.waitForSelector('text=Nothing uploaded yet');
const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('button:has-text("Upload photo")')]);
await chooser.setFiles(FX + 'camera-photo.jpg');
await page.waitForSelector('text=Uploaded as it is', { timeout: 60000 });
ok(true, `photo uploaded as it is (${(await page.locator('text=Uploaded as it is').first().textContent()).trim()})`);
await page.waitForSelector('.cms-lib__item');
ok((await page.locator('.cms-lib__item').count()) === 1, 'photo appears in the library');
// Nothing is resized or re-encoded: the stored file is the uploaded file.
const libSrc = await page.locator('.cms-lib__item img').first().getAttribute('src');
const storedUrl = libSrc.includes('/_next/image') ? new URL(base + libSrc).searchParams.get('url') : libSrc;
const stored = Buffer.from(await (await fetch(storedUrl)).arrayBuffer());
ok(stored.equals(fs.readFileSync(FX + 'camera-photo.jpg')), `stored photo is byte-for-byte the upload (${stored.length} bytes)`);
// ... and the public site shows it as it is: put it in the homepage gallery,
// publish, and read what a visitor's browser actually loads.
const homeDoc = await (await page.request.get(base + '/api/admin/content/home')).json();
const original = structuredClone(homeDoc.content);
const edited = structuredClone(homeDoc.content);
edited.story.gallery[0].src = storedUrl;
const saveAndPublish = async content => {
    ok((await page.request.put(base + '/api/admin/content/home', { data: { content } })).ok(), 'content saved', '');
    ok((await page.request.post(base + '/api/admin/content/home', { data: { action: 'publish' } })).ok(), 'content published', '');
};
await saveAndPublish(edited);
await ap.goto(base + '/');
const shown = await ap.evaluate(() => document.querySelector('.room-frame--lead img')?.currentSrc || '');
ok(shown === storedUrl, 'visitors get the uploaded photo exactly as uploaded (no re-encoding)', shown);
await saveAndPublish(original);
if (HAS_VIDEO) {
    const [vchooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('button:has-text("Upload video")')]);
    await vchooser.setFiles(FX + 'phone-video.mp4');
    // Uploaded as it is (videos are no longer re-encoded).
    // uploaded as-is where there is none (open-source Chromium builds).
    await page.waitForFunction(() => document.querySelectorAll('.cms-lib__item').length === 2, null, { timeout: 300000 });
    ok(true, 'video uploaded and appears in the library');
} else {
    console.log('  SKIP video upload (ffmpeg not installed)');
}
await page.screenshot({ path: SHOTS + 'admin-media.png' });

console.log('5. Menu Control: transparent dish -> plated -> live');
await page.goto(base + '/admin/menu');
await page.waitForSelector('text=71 dishes on the public menu, 4 hidden');
await page.screenshot({ path: SHOTS + 'admin-menu.png' });
await page.fill('input[type=search]', 'pad thai');
ok((await page.locator('tbody tr').count()) === 1, 'search filters the list');
await page.fill('input[type=search]', '');
await page.click('button:has-text("+ Add New Dish")');
await page.fill('#dish-title', 'QA Test Noodles');
await page.selectOption('#dish-category', 'e-noodles');
await page.fill('#dish-price', '499');
await page.fill('#dish-portion', '(2pcs)');
await page.fill('#dish-desc', 'A dish added by the QA run.');
await page.check('label:has-text("Spicy") input');
await page.check('label:has-text("New") input');
await page.setInputFiles('#dish-photo', FX + 'dish-with-background.png');
await page.waitForSelector('form [role=alert]');
ok((await page.textContent('form [role=alert]')).includes('still has its background'), 'a photo with its background is refused with guidance');
await page.setInputFiles('#dish-photo', FX + 'cutout-pad-thai.png');
await page.waitForSelector('img[alt="How the dish will look on the menu"]', { timeout: 60000 });
const src = await page.getAttribute('img[alt="How the dish will look on the menu"]', 'src');
ok(/dish-images\/dishes\/.+\.(webp|png|jpg)$/.test(src), `plated photo uploaded (${src.split('/').slice(-2).join('/')})`);
const platedWidth = await page.evaluate(u => new Promise(r => { const i = new Image(); i.onload = () => r(i.naturalWidth); i.onerror = () => r(0); i.src = u; }), src);
ok(platedWidth === 1600, `plated photo is stored at 1600 px (${platedWidth})`);
await page.screenshot({ path: SHOTS + 'admin-dish-form.png' });
await page.click('button:has-text("Save Dish")');
await page.waitForSelector('text=Dish added');
// The photo sweep runs after every save in QA (no grace period): a photo a
// dish uses must survive it.
const photoStatus = async () => (await fetch(src)).status;
const cutouts = async () => {
    const stem = src.split('/').pop().replace(/\.[^.]*$/, '');
    const r = await fetch(new URL('/storage/v1/object/list/dish-images', src), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prefix: 'originals' }) });
    return (await r.json()).filter(f => f.name.startsWith(stem)).length;
};
await new Promise(r => setTimeout(r, 1500));
ok((await photoStatus()) === 200 && (await cutouts()) === 1, 'sweep keeps the photo and cut-out of a dish in use');
await ap.goto(base + '/menu');
const html = await ap.content();
ok(html.includes('QA Test Noodles'), 'new dish is on the public menu');
const row = ap.locator('.menu-row:has-text("QA Test Noodles")');
ok((await row.locator('.menu-tag').allTextContents()).join(',').includes('Spicy'), 'badges show on the menu');
ok((await row.textContent()).includes('(2pcs)'), 'portion note shows');
ok(((await ap.textContent('.menu-hero-count')) || '').replace(/\s+/g, ' ').includes('72 dishes'), 'dish count updated');
// Edit: remove a badge.
await page.click('tr:has-text("QA Test Noodles") button:has-text("Edit")');
await page.uncheck('label:has-text("Spicy") input');
await page.click('button:has-text("Save Changes")');
await page.waitForSelector('text=Dish updated');
await ap.goto(base + '/menu');
ok(!(await ap.locator('.menu-row:has-text("QA Test Noodles") .menu-tag').allTextContents()).join(',').includes('Spicy'), 'edited badge removed on the menu');
// Hide, then show again - the dashboard overview counts what the menu shows.
const overview = await page.context().newPage(); // signed in, unlike ap
const liveDishes = async () => { await overview.goto(base + '/admin'); return Number(await overview.locator('div:text-is("Dishes on the menu") + div').textContent()); };
const before = await liveDishes();
await page.click('tr:has-text("QA Test Noodles") button:has-text("Hide")');
await page.waitForSelector('text=is hidden from the public menu');
await ap.goto(base + '/menu');
ok(!(await ap.content()).includes('QA Test Noodles'), 'hidden dish is off the public menu');
ok((await liveDishes()) === before - 1, 'overview count drops when a dish is hidden');
ok((await overview.content()).includes('QA Test Noodles'), 'overview lists the hidden dish');
await page.click('tr:has-text("QA Test Noodles") button:has-text("Show")');
await page.waitForSelector('text=is back on the public menu');
await ap.goto(base + '/menu');
ok((await ap.content()).includes('QA Test Noodles'), 'shown dish is back on the menu');
ok((await liveDishes()) === before, 'overview count restored');
await overview.close();
// Delete.
await page.click('tr:has-text("QA Test Noodles") button:has-text("Delete")');
await page.waitForSelector('text=deleted');
await ap.goto(base + '/menu');
ok(!(await ap.content()).includes('QA Test Noodles'), 'deleted dish is gone from the menu');
let gone = false;
for (let i = 0; i < 20 && !gone; i++) { await new Promise(r => setTimeout(r, 500)); gone = (await photoStatus()) === 404 && (await cutouts()) === 0; }
ok(gone, 'sweep removes the deleted dish\'s photo and cut-out');

console.log('5b. Footer colours follow the dashboard');
await page.goto(base + '/admin/content/footer');
await page.click('button:has-text("Background & colours")');
const colourField = label => page.locator(`.cms-field:has(> .cms-field__label :text-is("${label}"))`).first();
const setColour = async (label, hex) => {
    const f = colourField(label);
    await f.locator('button:has-text("Choose colour")').click();
    await f.locator('input.cms-input').fill(hex);
};
await setColour('Colour', '#f9eb9b');               // the background
// The footer's default white text on a light background: the editor says so.
ok(await page.locator('.cms-contrast-warning').first().isVisible(), 'editor warns that the footer text would be hard to read');
await setColour('Footer text colour', '#16233d');
await setColour('Footer accent colour', '#8d361f');
ok((await page.locator('.cms-contrast-warning').count()) === 0, 'warning clears once readable colours are chosen');
await publish();
await ap.goto(base + '/menu');
const footerColours = await ap.evaluate(() => {
    const c = s => getComputedStyle(document.querySelector(s));
    return { tagline: c('.footer-tagline').color, bottom: c('.footer-bottom').color, rule: c('.footer-nav').borderTopColor, outlet: c('.footer-outlet-name').color, bg: c('.site-footer').backgroundColor };
});
ok(footerColours.bg === 'rgb(249, 235, 155)', 'footer background colour applies', footerColours.bg);
ok(footerColours.tagline === 'rgb(22, 35, 61)', 'footer text colour applies', footerColours.tagline);
ok(/22, 35, 61|0\.086|0\.137/.test(footerColours.bottom) && footerColours.bottom !== 'rgba(255, 255, 255, 0.62)', 'copyright line follows the text colour', footerColours.bottom);
ok(!/255, 255, 255/.test(footerColours.rule), 'divider follows the text colour', footerColours.rule);
ok(footerColours.outlet === 'rgb(141, 54, 31)', 'footer accent colour applies', footerColours.outlet);
await ap.locator('.site-footer').screenshot({ path: SHOTS + 'footer-custom-colours.png' });
await page.click('button:has-text("Reset all to original")');
await publish();
await ap.goto(base + '/menu');
ok((await ap.evaluate(() => getComputedStyle(document.querySelector('.footer-tagline')).color)) === 'rgb(255, 255, 255)', 'footer colours reset to the design');

console.log('6. Sign out');
await page.click('button:has-text("Sign Out")');
await page.waitForURL(/\/admin\/login/);
await page.goto(base + '/admin/menu');
ok(page.url().includes('/admin/login'), 'signed out cannot reach Menu Control');

const csp = consoleErrors.filter(e => /Content Security Policy|Refused to/i.test(e));
ok(csp.length === 0, 'no CSP violations', csp.join('\n'));
const other = consoleErrors.filter(e => !/Content Security Policy|Refused to/i.test(e) && !/status of 40[01]/.test(e) && !/_next\/image/.test(e));
console.log('console errors (excluding expected 401s):', other.length ? '\n' + other.join('\n') : 'none');
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
