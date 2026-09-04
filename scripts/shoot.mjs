/**
 * Screenshot the running site to PNGs on disk, so a change can be LOOKED at
 * rather than only measured.
 *
 * This exists because the in-app browser pane cannot composite frames, so its
 * screenshot tool always times out - and design work was being "verified" with
 * contrast ratios and grid measurements, which catch none of the things that
 * actually make a page look wrong: alignment, rhythm, weight, crowding.
 *
 * Same CDP plumbing as check-contrast.mjs (zero dependencies, drives whatever
 * Chrome is installed).
 *
 * Usage:
 *   node scripts/shoot.mjs                       # default shots, 1440x900
 *   node scripts/shoot.mjs --w 390 --h 844       # phone
 *   node scripts/shoot.mjs --url /menu --at 4000 --name menu-grid
 *   node scripts/shoot.mjs --full --url /        # whole page, stitched
 */

import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback;
};
const flag = (name) => args.includes(`--${name}`);

const BASE = arg('base', 'http://localhost:3200');
const W = Number(arg('w', 1440));
const H = Number(arg('h', 900));
const OUT = arg('out', 'scratch-shots');
const PORT = 9500 + Math.floor(Math.random() * 400);

const CHROME_CANDIDATES = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

/* A shot is a page, a scroll offset, and a name. Scroll offsets beat element
   selectors here: the point is to see what a visitor sees in one viewport. */
const DEFAULT_SHOTS = [
    { url: '/', at: 0, name: 'home-01-hero' },
    { url: '/', at: 900, name: 'home-02-flame' },
    { url: '/', at: 1900, name: 'home-03-heritage' },
    { url: '/', at: 2700, name: 'home-04-gallery' },
    { url: '/', at: 3600, name: 'home-05-features' },
    { url: '/', at: 4500, name: 'home-06-features2' },
    { url: '/', at: 5600, name: 'home-07-havens' },
    { url: '/', at: 6800, name: 'home-08-gift' },
    { url: '/menu', at: 0, name: 'menu-01-hero' },
    { url: '/menu', at: 900, name: 'menu-02-firstrow' },
    { url: '/menu', at: 2200, name: 'menu-03-grid' },
    { url: '/menu', at: 5200, name: 'menu-04-grid2' },
];

const SHOTS = arg('url', null)
    ? [{ url: arg('url'), at: Number(arg('at', 0)), name: arg('name', 'shot') }]
    : DEFAULT_SHOTS;

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

async function main() {
    const chrome = CHROME_CANDIDATES.find(Boolean);
    const profile = await mkdtemp(join(tmpdir(), 'khaosan-shoot-'));
    await mkdir(OUT, { recursive: true });

    /* HEADED, parked off-screen - not --headless.
       New-headless on this machine will not composite for CDP captures:
       fromSurface:true gives solid black, fromSurface:false gives a
       half-rasterised page, and --disable-gpu / swiftshader / bringToFront
       change nothing. A real window composites correctly - and it has to be
       ON SCREEN: parked at -4000,0 it does not paint either, so the window
       appears briefly while shooting. That is the cost of getting a true
       render out of this machine.
       (Chrome's own `--screenshot` CLI also works, but it cannot scroll and
       cannot be handed the settle CSS below, so anchor-only shots came back
       covered by the ignition veil.) */
    const proc = spawn(chrome, [
        `--remote-debugging-port=${PORT}`, '--remote-allow-origins=*',
        `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check',
        '--hide-scrollbars', '--force-prefers-reduced-motion',
        '--disable-extensions', '--disable-background-networking',
        /* Without this the OS scale (1.25 here) applies: the window reports
           1152 CSS px for a 1440 request and every capture is off-layout. */
        '--force-device-scale-factor=1',
        '--window-position=0,0', `--window-size=${W},${H + 120}`,
    ], { stdio: 'ignore' });

    try {
        await waitForDevtools();
        const tab = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
        const ws = new WebSocket(tab.webSocketDebuggerUrl);
        await new Promise((r) => ws.addEventListener('open', r, { once: true }));
        const send = cdp(ws);

        await send('Page.enable');
        /* Deliberately NO Emulation.setDeviceMetricsOverride. On a headed
           window the override desynchronises the widget from the compositor
           and every capture comes back as a solid rectangle. The window is
           already sized by --window-size, so the override buys nothing. */

        let current = null;
        for (const shot of SHOTS) {
            if (shot.url !== current) {
                await send('Page.navigate', { url: BASE + shot.url });
                await new Promise((r) => setTimeout(r, 4500));
                current = shot.url;
            }
            /* Two things would otherwise make every shot useless.
               1. The ignition veil: a fixed #0C1220 sheet over the whole page
                  that recedes by animation. Under forced reduced-motion the
                  animation never runs, so the first capture came back as a
                  solid near-black rectangle. Marking the ritual "lit" is what
                  a returning visitor sees anyway.
               2. `.reveal-hidden`: scroll-reveal start state. Anything not yet
                  revealed is transparent, so lower sections photograph blank.
               Both are forced to their settled state here. */
            await send('Runtime.evaluate', {
                expression: `
                  document.documentElement.setAttribute('data-ignition','lit');
                  if (!document.getElementById('shoot-settle')) {
                    const s = document.createElement('style');
                    s.id = 'shoot-settle';
                    s.textContent = '.ignition-veil{display:none!important}' +
                      '.reveal-hidden,.reveal-toss,[class*="reveal"]{opacity:1!important;transform:none!important;visibility:visible!important;filter:none!important}';
                    document.head.appendChild(s);
                  }
                  window.scrollTo(0, ${shot.at});
                  window.dispatchEvent(new Event('scroll'));
                `,
            });
            await new Promise((r) => setTimeout(r, 1800));
            await send('Runtime.evaluate', {
                expression: `Promise.all([...document.images].filter(i=>!i.complete).map(i=>i.decode().catch(()=>{})))`,
                awaitPromise: true,
            });
            await new Promise((r) => setTimeout(r, 600));

            /* Without this the capture comes back solid black: the target
               created via /json/new is not the frontmost one, and an
               unfocused target in new-headless never composites. */
            await send('Page.bringToFront');
            const res = await send('Page.captureScreenshot',
                flag('full')
                    ? { format: 'png', captureBeyondViewport: true }
                    : { format: 'png' });
            const file = join(OUT, `${shot.name}-${W}.png`);
            await writeFile(file, Buffer.from(res.result.data, 'base64'));
            console.log(`  shot  ${file}`);
        }
        ws.close();
    } finally {
        proc.kill();
        await rm(profile, { recursive: true, force: true }).catch(() => {});
    }
}

main().catch((err) => { console.error(err); process.exit(1); });
