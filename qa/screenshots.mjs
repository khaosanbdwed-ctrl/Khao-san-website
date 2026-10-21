// Usage: node qa/screenshots.mjs <baseUrl> <outDir> [--pages=/,/menu] [--vps=390,1440] [--motion] [--chunks=40]
// Captures viewport-sized chunks down each page at each width (so sticky and
// fixed UI renders as a visitor sees it) and reports horizontal overflow,
// small tap targets, tiny text, console errors and failed requests. Compare
// two runs before and after a change to catch visual regressions.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [base, out] = process.argv.slice(2);
const arg = (k, d) => (process.argv.find(a => a.startsWith(`--${k}=`))?.split('=')[1] ?? d);
const flag = k => process.argv.includes(`--${k}`);
const PAGES = arg('pages', '/,/menu,/legal/privacy,/legal/terms,/does-not-exist').split(',');
const VIEWPORTS = {
    360: [360, 740], 390: [390, 844], 430: [430, 932], 768: [768, 1024], 820: [820, 1180],
    1024: [1024, 768], 1280: [1280, 800], 1440: [1440, 900], 1920: [1920, 1080],
};
const VPS = arg('vps', '360,390,768,1024,1280,1440,1920').split(',').map(Number);
const MAX_CHUNKS = Number(arg('chunks', '40'));
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.QA_CHROMIUM || undefined, args: ['--autoplay-policy=no-user-gesture-required'] });
const report = [];

for (const vp of VPS) {
    const [w, h] = VIEWPORTS[vp];
    const isMobile = w < 768;
    const ctx = await browser.newContext({
        viewport: { width: w, height: h },
        deviceScaleFactor: 1,
        isMobile, hasTouch: w < 1025,
        reducedMotion: flag('motion') ? 'no-preference' : 'reduce',
    });
    await ctx.addInitScript(() => { try { sessionStorage.setItem('khaosan-ignited', '1'); } catch {} });
    if (flag('admin')) {
        const r = await ctx.request.post(`${base}/api/auth/login`, { data: { username: process.env.QA_USER || 'qa-admin', password: process.env.QA_PASS || 'Qa-Strong-Passw0rd-2026!' }, headers: { origin: base } });
        if (!r.ok()) throw new Error('login failed ' + r.status());
    }
    for (const p of PAGES) {
        const page = await ctx.newPage();
        const errors = [];
        const failed = [];
        page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text().slice(0, 300)}`); });
        page.on('pageerror', e => errors.push('pageerror: ' + e.message.slice(0, 300)));
        page.on('requestfailed', r => failed.push(`${r.failure()?.errorText} ${r.url().slice(0, 160)}`));
        page.on('response', r => { if (r.status() >= 400 && !r.url().includes('does-not-exist')) failed.push(`${r.status()} ${r.url().slice(0, 160)}`); });
        const slug = (p === '/' ? 'home' : p.replace(/^\//, '').replace(/[/#?]/g, '_')) + `-${vp}`;
        try {
            await page.goto(base + p, { waitUntil: 'networkidle', timeout: 45000 });
        } catch (e) { errors.push('goto: ' + e.message.slice(0, 200)); }
        await page.waitForTimeout(400);
        const docH = await page.evaluate(() => document.documentElement.scrollHeight);
        const chunks = Math.min(MAX_CHUNKS, Math.ceil(docH / h));
        for (let i = 0; i < chunks; i++) {
            await page.evaluate(y => window.scrollTo(0, y), i * h);
            await page.waitForTimeout(i === 0 ? 300 : 450);
            await page.screenshot({ path: path.join(out, `${slug}-${String(i).padStart(2, '0')}.png`) });
        }
        // Overflow audit at the end of the scroll (everything revealed).
        const audit = await page.evaluate(() => {
            const vw = document.documentElement.clientWidth;
            const sw = document.documentElement.scrollWidth;
            const wide = [];
            for (const el of document.querySelectorAll('body *')) {
                const r = el.getBoundingClientRect();
                if (r.width === 0 || r.height === 0) continue;
                const cs = getComputedStyle(el);
                if (cs.position === 'fixed') continue;
                if (r.right > vw + 1 || r.left < -1) {
                    // ignore descendants of clipped scrollers
                    let p = el.parentElement, clipped = false;
                    while (p) { const s = getComputedStyle(p); if (/(hidden|clip|auto|scroll)/.test(s.overflowX)) { const pr = p.getBoundingClientRect(); if (pr.right <= vw + 1 && pr.left >= -1) { clipped = true; break; } } p = p.parentElement; }
                    if (!clipped) wide.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} [${Math.round(r.left)}..${Math.round(r.right)}]`);
                }
            }
            const small = [];
            for (const el of document.querySelectorAll('a, button, input, select, textarea, [role=button]')) {
                const r = el.getBoundingClientRect();
                if (r.width === 0 || r.height === 0) continue;
                const cs = getComputedStyle(el);
                if (cs.visibility === 'hidden' || cs.opacity === '0') continue;
                if (r.width < 24 || r.height < 24) small.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 30)} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 20)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
            }
            const tinyText = [];
            for (const el of document.querySelectorAll('p, span, a, li, h1, h2, h3, button, dt, dd, address')) {
                if (!el.childNodes.length || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
                const fs = parseFloat(getComputedStyle(el).fontSize);
                const r = el.getBoundingClientRect();
                if (r.width && fs < 12) tinyText.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 30)} ${fs}px "${el.textContent.trim().slice(0, 24)}"`);
            }
            return { vw, sw, overflow: sw > vw, wide: [...new Set(wide)].slice(0, 15), small: [...new Set(small)].slice(0, 20), tinyText: [...new Set(tinyText)].slice(0, 15), height: document.documentElement.scrollHeight };
        });
        report.push({ page: p, vp, chunks, ...audit, errors: [...new Set(errors)].slice(0, 20), failed: [...new Set(failed)].slice(0, 20) });
        await page.close();
    }
    await ctx.close();
}
await browser.close();
fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
for (const r of report) {
    console.log(`${r.page} @${r.vp}: h=${r.height} overflow=${r.overflow}(${r.sw}/${r.vw}) wide=${r.wide.length} small=${r.small.length} tiny=${r.tinyText.length} errors=${r.errors.length} failed=${r.failed.length}`);
}
