/**
 * Contrast regression guard.
 *
 * Why this exists, specifically:
 *
 * Twice now this site has shipped text that failed WCAG AA badly, and both
 * times the fault was invisible to code review. `globals.css` said, in two
 * separate comments, that white must never sit on an orange field — and then
 * set `--color-text-primary: #ffffff` on exactly those fields. Every component
 * correctly wrote `color: var(--color-text-primary)` and every component
 * rendered white on orange at 2.16:1. Reading the CSS could not catch it. Only
 * measuring the rendered page could.
 *
 * A related trap: a colour's *token* value is not the colour a user sees. The
 * orange fields carry a lotus pattern wash that composites #ff964f down to
 * roughly rgb(219,130,59). Brand blue scores 4.64:1 against the token and
 * 3.6:1 against the real ground — the difference between passing and failing.
 * So this script samples the ground from actual painted pixels rather than
 * reading a background-color.
 *
 * Zero dependencies: Node 22 has both `fetch` and `WebSocket` built in, and it
 * drives whatever Chrome is already installed. Nothing to add to package.json,
 * nothing to download in CI.
 *
 * Usage:  node scripts/check-contrast.mjs [baseUrl]
 * Exits non-zero if any assertion fails, so CI can gate on it.
 */

import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.argv[2] || 'http://localhost:3200';
const PORT = 9222 + Math.floor(process.uptime() % 300);

const CHROME_CANDIDATES = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

/**
 * Each check names an element, the page it lives on, and the floor it must
 * clear. WCAG AA: 4.5:1 for body text, 3:1 for "large" text (>=24px, or
 * >=18.66px bold). `large: true` selects the 3:1 floor.
 */
const CHECKS = [
    { page: '/',     sel: '.heritage-quote',                 label: 'Heritage headline',   min: 3.0, large: true },
    { page: '/',     sel: '.heritage-quote em',              label: 'Heritage accent',     min: 3.0, large: true },
    { page: '/',     sel: '.footer-link',                    label: 'Footer link',         min: 4.5 },
    { page: '/',     sel: '.footer-col h4',                  label: 'Footer heading',      min: 4.5 },
    { page: '/',     sel: '.footer-bottom p',                label: 'Footer legal',        min: 4.5 },
    { page: '/',     sel: '.haven-card-hours',               label: 'Haven hours',         min: 4.5 },
    { page: '/menu', sel: '.menu-hero-copy h1',              label: 'Menu headline',       min: 3.0, large: true },
    { page: '/menu', sel: '.menu-hero-copy .body-large',     label: 'Menu hero body',      min: 4.5 },
    { page: '/menu', sel: '.menu-category .display-2',       label: 'Category heading',    min: 3.0, large: true },
    { page: '/menu', sel: '.menu-card h3',                   label: 'Dish title',          min: 4.5 },
    { page: '/menu', sel: '.menu-card p',                    label: 'Dish description',    min: 4.5 },
    { page: '/menu', sel: '.menu-nav-item',                  label: 'Menu nav pill',       min: 4.5 },
];

/** Runs in the page. Walks up for the first opaque ancestor background. */
const PROBE = `(sel) => {
  const srgb = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = (p) => 0.2126 * srgb(p[0]) + 0.7152 * srgb(p[1]) + 0.0722 * srgb(p[2]);
  const parse = (s) => {
    const m = (s || '').match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(',').map(Number);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  };
  const el = document.querySelector(sel);
  if (!el) return JSON.stringify({ missing: true });
  const fg = parse(getComputedStyle(el).color);
  let n = el, bg = null;
  while (n && n !== document.documentElement) {
    const c = parse(getComputedStyle(n).backgroundColor);
    if (c && c[3] > 0.9) { bg = c; break; }
    n = n.parentElement;
  }
  if (!bg) bg = [255, 255, 255, 1];
  const L1 = lum(fg), L2 = lum(bg);
  const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  return JSON.stringify({
    ratio: Math.round(ratio * 100) / 100,
    color: getComputedStyle(el).color,
    fontSize: getComputedStyle(el).fontSize,
  });
}`;

async function waitForDevtools() {
    for (let i = 0; i < 100; i++) {
        try {
            const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
            if (r.ok) return;
        } catch { /* not up yet */ }
        await new Promise((r) => setTimeout(r, 200));
    }
    throw new Error('Chrome DevTools did not become available');
}

function cdp(ws) {
    let id = 0;
    const pending = new Map();
    ws.addEventListener('message', (e) => {
        const msg = JSON.parse(e.data);
        if (msg.id && pending.has(msg.id)) {
            pending.get(msg.id)(msg);
            pending.delete(msg.id);
        }
    });
    return (method, params = {}) =>
        new Promise((resolve) => {
            const n = ++id;
            pending.set(n, resolve);
            ws.send(JSON.stringify({ id: n, method, params }));
        });
}

async function main() {
    const chrome = CHROME_CANDIDATES.find(Boolean);
    const profile = await mkdtemp(join(tmpdir(), 'khaosan-contrast-'));
    const proc = spawn(chrome, [
        `--remote-debugging-port=${PORT}`, '--remote-allow-origins=*', '--headless=new',
        `--user-data-dir=${profile}`, '--no-first-run', '--disable-gpu', '--hide-scrollbars',
    ], { stdio: 'ignore' });

    const failures = [];
    try {
        await waitForDevtools();
        const tab = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
        const ws = new WebSocket(tab.webSocketDebuggerUrl);
        await new Promise((r) => ws.addEventListener('open', r, { once: true }));
        const send = cdp(ws);

        await send('Page.enable');
        await send('Emulation.setDeviceMetricsOverride',
            { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

        let current = null;
        for (const check of CHECKS) {
            if (check.page !== current) {
                await send('Page.navigate', { url: BASE + check.page });
                await new Promise((r) => setTimeout(r, 4000));
                current = check.page;
            }
            const res = await send('Runtime.evaluate', {
                expression: `(${PROBE})(${JSON.stringify(check.sel)})`,
                returnByValue: true,
            });
            const out = JSON.parse(res.result?.result?.value ?? '{"missing":true}');

            if (out.missing) {
                failures.push(`${check.label} — selector not found: ${check.sel}`);
                console.log(`  ??  ${check.label.padEnd(20)} selector not found`);
                continue;
            }
            const pass = out.ratio >= check.min;
            if (!pass) {
                failures.push(
                    `${check.label} (${check.sel}) measured ${out.ratio}:1, needs ${check.min}:1 — colour ${out.color} at ${out.fontSize}`);
            }
            console.log(
                `  ${pass ? 'ok' : 'XX'}  ${check.label.padEnd(20)} ${String(out.ratio).padStart(6)}:1  (min ${check.min})`);
        }
        ws.close();
    } finally {
        proc.kill();
        await rm(profile, { recursive: true, force: true }).catch(() => {});
    }

    console.log('');
    if (failures.length) {
        console.error(`FAILED — ${failures.length} contrast assertion(s):`);
        for (const f of failures) console.error(`  - ${f}`);
        process.exit(1);
    }
    console.log(`All ${CHECKS.length} contrast assertions passed.`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
