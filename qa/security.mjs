// Security regression suite against a running PRODUCTION build (next start)
// that talks to qa/mock-supabase.mjs with the credentials in qa/env.qa.
//   node qa/security.mjs http://localhost:3400
// Pass `dev` as a second argument against `next dev` (different cookie name).
import { request } from 'playwright';
import crypto from 'node:crypto';

const base = process.argv[2];
const USER = process.env.QA_USER || 'qa-admin', PASS = process.env.QA_PASS || 'Qa-Strong-Passw0rd-2026!', SVC = process.env.QA_SVC || 'mock-service-role-key-0123456789abcdef';
let pass = 0, fail = 0;
const ok = (cond, name, extra = '') => { if (cond) { pass++; console.log('  PASS', name); } else { fail++; console.log('  FAIL', name, extra); } };

const prod = !(process.argv[3] === 'dev');
const COOKIE = prod ? '__Host-khao_san_admin' : 'khao_san_admin_session';

function token(expSecondsFromNow, secret = `khao-san-admin:${PASS}:${SVC}`) {
    const payload = `v1.${Math.floor(Date.now() / 1000) + expSecondsFromNow}`;
    const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    return `${payload}.${sig}`;
}

const anon = await request.newContext({ baseURL: base });
const ADMIN_ROUTES = [
    ['GET', '/api/admin/content'], ['GET', '/api/admin/content/home'], ['PUT', '/api/admin/content/home'], ['POST', '/api/admin/content/home'],
    ['GET', '/api/admin/media'], ['POST', '/api/admin/media'], ['DELETE', '/api/admin/media'],
    ['GET', '/api/admin/menu'], ['POST', '/api/admin/menu'], ['PUT', '/api/admin/menu'], ['DELETE', '/api/admin/menu?id=x'],
    ['GET', '/api/admin/preview?path=/'], ['POST', '/api/admin/upload'],
];

console.log('1. Every admin API refuses an anonymous caller');
for (const [m, p] of ADMIN_ROUTES) {
    const r = await anon.fetch(p, { method: m, data: m === 'GET' ? undefined : {}, maxRedirects: 0 });
    ok(r.status() === 401, `${m} ${p} -> ${r.status()}`);
}

console.log('2. Forged / tampered / expired cookies are refused');
const forged = [
    ['literal "authenticated"', 'authenticated'],
    ['wrong secret', token(3600, 'guess')],
    ['expired', token(-60)],
    ['tampered expiry', token(3600).replace(/^v1\.\d+/, 'v1.9999999999')],
    ['garbage', 'v1.abc.def'],
];
for (const [name, value] of forged) {
    const r = await anon.fetch('/api/admin/menu', { headers: { cookie: `${COOKIE}=${value}` } });
    ok(r.status() === 401, `${name} -> ${r.status()}`);
    const page = await anon.fetch('/admin', { headers: { cookie: `${COOKIE}=${value}` }, maxRedirects: 0 });
    ok([307, 308].includes(page.status()) && /\/admin\/login/.test(page.headers()['location'] || ''), `${name} on /admin redirects to login (${page.status()})`);
}

console.log('3. Framework-bypass header does not unlock anything');
for (const h of ['middleware', 'proxy', 'src/middleware', 'middleware:middleware:middleware:middleware:middleware', 'proxy:proxy:proxy:proxy:proxy']) {
    const r = await anon.fetch('/api/admin/menu', { headers: { 'x-middleware-subrequest': h } });
    ok(r.status() === 401, `x-middleware-subrequest: ${h} -> ${r.status()}`);
    const p = await anon.fetch('/admin', { headers: { 'x-middleware-subrequest': h }, maxRedirects: 0 });
    ok(p.status() !== 200, `/admin with bypass header not served (${p.status()})`);
}

console.log('4. Login brute force is slowed and then stopped');
const ip = `203.0.113.${Math.floor(Math.random() * 200) + 1}`;
let last, t0 = Date.now();
for (let i = 0; i < 9; i++) {
    last = await anon.post('/api/auth/login', { data: { username: USER, password: 'wrong' + i }, headers: { 'x-real-ip': ip } });
}
const elapsed = Date.now() - t0;
ok(last.status() === 429, `9th wrong attempt -> ${last.status()}`);
ok(elapsed > 8 * 500, `failed attempts are delayed (${elapsed}ms for 9)`);
const lockedRight = await anon.post('/api/auth/login', { data: { username: USER, password: PASS }, headers: { 'x-real-ip': ip } });
ok(lockedRight.status() === 429, `even the right password is refused while locked (${lockedRight.status()})`);
const big = await anon.post('/api/auth/login', { data: { username: 'a'.repeat(10000), password: 'b' } });
ok(big.status() === 400, `oversized login body refused (${big.status()})`);

console.log('5. Real login issues a hardened cookie');
const admin = await request.newContext({ baseURL: base });
const login = await admin.post('/api/auth/login', { data: { username: USER, password: PASS }, headers: { 'x-real-ip': '198.51.100.7' } });
ok(login.status() === 200, `login -> ${login.status()}`);
const setCookie = login.headersArray().filter(h => h.name.toLowerCase() === 'set-cookie').map(h => h.value).join('\n');
ok(setCookie.includes(`${COOKIE}=`), `cookie name ${COOKIE}`);
ok(/httponly/i.test(setCookie), 'HttpOnly');
ok(/samesite=lax/i.test(setCookie), 'SameSite=Lax');
if (prod) ok(/secure/i.test(setCookie), 'Secure');
const session = setCookie.match(new RegExp(`${COOKIE}=([^;]+)`))?.[1];
const authed = { cookie: `${COOKIE}=${session}` };
const r1 = await admin.fetch('/api/admin/menu', { headers: authed });
ok(r1.status() === 200, `authenticated GET menu -> ${r1.status()}`);

console.log('6. Cross-site writes are refused even with a valid session');
const cs = await admin.fetch('/api/admin/content/home', { method: 'PUT', headers: { ...authed, origin: 'https://evil.example', 'content-type': 'application/json' }, data: { content: {} } });
ok(cs.status() === 403, `foreign Origin -> ${cs.status()}`);
const cs2 = await admin.fetch('/api/admin/content/home', { method: 'PUT', headers: { ...authed, 'sec-fetch-site': 'cross-site', 'content-type': 'application/json' }, data: { content: {} } });
ok(cs2.status() === 403, `Sec-Fetch-Site cross-site -> ${cs2.status()}`);

console.log('7. Preview cannot be turned into an open redirect');
for (const raw of ['//evil.example', '/.//evil.example', '/\\evil.example', 'https://evil.example', '/%09/evil.example', 'javascript:alert(1)']) {
    const r = await admin.fetch(`/api/admin/preview?path=${encodeURIComponent(raw)}`, { headers: authed, maxRedirects: 0 });
    const loc = r.headers()['location'] || '';
    const host = new URL(loc, base).host;
    ok(host === new URL(base).host && !loc.startsWith('//'), `${raw} -> ${loc}`);
}

console.log('8. CMS content is sanitised on save');
const evil = {
    content: {
        hero: {
            visible: true, logo: 'javascript:alert(1)', title: '<script>alert(1)</script>', eyebrow: '<img src=x onerror=alert(1)>',
            primaryButton: { label: 'X', type: 'url', url: 'javascript:alert(1)', message: '' },
            secondaryButton: { label: 'Y', type: 'url', url: 'data:text/html,<script>alert(1)</script>', message: '' },
            background: { image: 'javascript:alert(1)', video: 'vbscript:x', color: 'red;background:url(x)', overlayOpacity: 9999, textTone: 'evil', focus: 'evil' },
        },
        story: { quote: 'Hi [click](javascript:alert(1)) *ok*' },
        sectionOrder: ['hero', 'nope', '__proto__'],
    },
};
const put = await admin.fetch('/api/admin/content/home', { method: 'PUT', headers: { ...authed, 'content-type': 'application/json', origin: base }, data: evil });
ok(put.status() === 200, `save draft -> ${put.status()}`);
const saved = (await put.json()).content;
ok(saved.hero.logo === '', `image javascript: dropped (${JSON.stringify(saved.hero.logo)})`);
ok(saved.hero.primaryButton.url === '', `button javascript: dropped (${saved.hero.primaryButton.url})`);
ok(saved.hero.secondaryButton.url === '', `button data: dropped (${saved.hero.secondaryButton.url})`);
ok(saved.hero.background.image === '' && saved.hero.background.video === '', 'background media urls dropped');
ok(!saved.hero.background.color.includes(';'), `background colour validated (${saved.hero.background.color})`);
ok(saved.hero.background.overlayOpacity === 100, `opacity clamped (${saved.hero.background.overlayOpacity})`);
ok(saved.hero.background.textTone === 'auto' && saved.hero.background.focus === 'auto', 'enum fields validated');
ok(!saved.sectionOrder.includes('nope') && !saved.sectionOrder.includes('__proto__') && saved.sectionOrder.length === 6, `section order validated (${saved.sectionOrder})`);
// Render the draft through preview and inspect the HTML.
const pv = await admin.fetch('/api/admin/preview?path=/', { headers: authed, maxRedirects: 0 });
const draftCookies = pv.headersArray().filter(h => h.name.toLowerCase() === 'set-cookie').map(h => h.value.split(';')[0]).join('; ');
const html = await (await admin.fetch('/', { headers: { cookie: `${authed.cookie}; ${draftCookies}` } })).text();
ok(html.includes('Preview: you are seeing unpublished changes') || html.includes('cms-preview-bar'), 'preview renders the draft');
ok(!/<script>alert\(1\)<\/script>/.test(html), 'typed <script> is escaped, not executed');
ok(!/href="javascript:/i.test(html) && !/src="javascript:/i.test(html), 'no javascript: URLs in the page');
ok(!/<img src=x onerror/i.test(html), 'typed <img onerror> is escaped');
// Public visitor never sees the draft.
const pub = await (await anon.fetch('/')).text();
ok(!pub.includes('&lt;script&gt;alert(1)') && !pub.includes('cms-preview-bar'), 'public site does not show the draft');
await admin.fetch('/api/admin/content/home', { method: 'POST', headers: { ...authed, 'content-type': 'application/json', origin: base }, data: { action: 'discard' } });

console.log('9. JSON-LD cannot be broken out of');
const locPut = await admin.fetch('/api/admin/content/locations', { method: 'PUT', headers: { ...authed, 'content-type': 'application/json', origin: base }, data: { content: { outlets: { items: [{ name: 'X</script><script>alert(1)</script>', address: 'A', phone: '1', whatsapp: '1', mapQuery: '', image: '', hours: [] }] } } } });
ok(locPut.status() === 200, 'save outlet with </script> in its name');
const html2 = await (await admin.fetch('/', { headers: { cookie: `${authed.cookie}; ${draftCookies}` } })).text();
ok(!html2.includes('</script><script>alert(1)'), 'name is escaped inside the ld+json block');
await admin.fetch('/api/admin/content/locations', { method: 'POST', headers: { ...authed, 'content-type': 'application/json', origin: base }, data: { action: 'discard' } });

console.log('10. Menu API validates input');
const bad = [
    [{ category_id: 'a-appetizers', title: 'T', price: '1', badges: ['<b>'] }, 'unknown badge'],
    [{ category_id: 'a-appetizers', title: 'T', price: '1', image_src: 'javascript:alert(1)' }, 'javascript: photo'],
    [{ category_id: 'a-appetizers', title: 'x'.repeat(500), price: '1' }, 'title too long'],
    [{ category_id: 'a-appetizers', title: 'T', price: '1', description: { $gt: '' } }, 'object description'],
    [{ category_id: 'nope', title: 'T', price: '1' }, 'unknown category'],
];
for (const [data, name] of bad) {
    const r = await admin.fetch('/api/admin/menu', { method: 'POST', headers: { ...authed, origin: base }, data });
    ok(r.status() === 400, `${name} -> ${r.status()}`);
}
const badId = await admin.fetch('/api/admin/menu', { method: 'PUT', headers: { ...authed, origin: base }, data: { id: "1' or '1'='1", title: 'x' } });
ok(badId.status() === 400, `non-uuid id refused (${badId.status()})`);

console.log('11. Logout ends the session cookie');
const out = await admin.post('/api/auth/logout', { headers: { ...authed, origin: base } });
const outCookie = out.headersArray().filter(h => h.name.toLowerCase() === 'set-cookie').map(h => h.value).join('\n');
ok(new RegExp(`${COOKIE}=;`).test(outCookie) && /expires=Thu, 01 Jan 1970/i.test(outCookie), 'cookie cleared');

console.log('12. Security headers');
const h = (await anon.fetch('/')).headers();
ok(!h['x-powered-by'], 'no X-Powered-By');
ok(/frame-ancestors 'self'/.test(h['content-security-policy'] || '') || !prod, 'CSP frame-ancestors');
ok(/object-src 'none'/.test(h['content-security-policy'] || '') || !prod, 'CSP object-src none');
ok(h['strict-transport-security']?.includes('max-age=63072000'), 'HSTS');
ok(h['x-content-type-options'] === 'nosniff', 'nosniff');
const ah = (await anon.fetch('/admin/login')).headers();
ok(/no-store/.test(ah['cache-control'] || ''), `admin no-store (${ah['cache-control']})`);
ok(/noindex/.test(ah['x-robots-tag'] || ''), 'admin noindex');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
